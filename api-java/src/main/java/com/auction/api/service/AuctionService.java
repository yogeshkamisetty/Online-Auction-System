package com.auction.api.service;

import com.auction.api.dto.*;
import com.auction.api.entity.*;
import com.auction.api.repository.AuctionRepository;
import com.auction.api.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    public AuctionService(AuctionRepository auctionRepository, UserRepository userRepository) {
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
    }

    public List<AuctionResponse> getAuctions(String statusStr, Boolean featured, String sellerId, String category, String search) {
        AuctionStatus status = AuctionStatus.ACTIVE;
        if (statusStr != null) {
            try {
                status = AuctionStatus.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status filter");
            }
        }

        // Restrict to public statuses
        if (status == AuctionStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status filter");
        }

        final AuctionStatus finalStatus = status;

        Specification<Auction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), finalStatus));

            if (featured != null && featured) {
                predicates.add(cb.equal(root.get("featured"), true));
            }

            if (sellerId != null && !sellerId.isEmpty()) {
                predicates.add(cb.equal(root.get("seller").get("id"), sellerId));
            }

            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), category.toLowerCase()));
            }

            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), likePattern);
                Predicate descPredicate = cb.like(cb.lower(root.get("description")), likePattern);
                predicates.add(cb.or(titlePredicate, descPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Auction> auctions = auctionRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        return auctions.stream().map(this::mapToAuctionResponseLight).collect(Collectors.toList());
    }

    public AuctionResponse getAuctionById(String id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        return mapToAuctionResponseFull(auction);
    }

    public AuctionResponse createAuction(String sellerId, CreateAuctionRequest request) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        Auction auction = Auction.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .condition(request.getCondition())
                .imageUrl(request.getImageUrl())
                .startPrice(request.getStartPrice())
                .currentBid(request.getStartPrice())
                .endTime(request.getEndTime())
                .status(AuctionStatus.ACTIVE) // Created ACTIVE by default in Express
                .seller(seller)
                .build();

        auction = auctionRepository.save(auction);
        return mapToAuctionResponseFull(auction);
    }

    public SettleResponse settleAuction(String userId, String auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        if (auction.getStatus() != AuctionStatus.CLOSED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Auction must be closed before settling");
        }

        // Find winning bid (highest bid)
        if (auction.getBids() == null || auction.getBids().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No bids found on this auction");
        }

        // Sort bids manually by amount desc, since JPA mapping is unsorted
        Bid winningBid = auction.getBids().stream()
                .max((b1, b2) -> b1.getAmount().compareTo(b2.getAmount()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No bids found on this auction"));

        if (!winningBid.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the winning bidder can settle this auction");
        }

        BigDecimal SELLER_COMMISSION_RATE = new BigDecimal("0.10");
        BigDecimal BUYER_PREMIUM_RATE = new BigDecimal("0.05");
        BigDecimal hammer = winningBid.getAmount();

        BigDecimal platformFee = hammer.multiply(SELLER_COMMISSION_RATE);
        BigDecimal buyerPremium = hammer.multiply(BUYER_PREMIUM_RATE);

        auction.setStatus(AuctionStatus.SETTLED);
        auction.setPlatformFee(platformFee);
        auction.setBuyerPremium(buyerPremium);

        auction = auctionRepository.save(auction);

        SettleResponse.SettleSummary summary = SettleResponse.SettleSummary.builder()
                .hammerPrice(hammer)
                .buyerPremium(buyerPremium)
                .totalPaid(hammer.add(buyerPremium))
                .sellerReceives(hammer.subtract(platformFee))
                .build();

        return SettleResponse.builder()
                .message("Purchase confirmed. Thank you!")
                .auction(mapToAuctionResponseFull(auction))
                .summary(summary)
                .build();
    }

    // Light mapping for lists
    public AuctionResponse mapToAuctionResponseLight(Auction auction) {
        return AuctionResponse.builder()
                .id(auction.getId())
                .title(auction.getTitle())
                .description(auction.getDescription())
                .category(auction.getCategory())
                .condition(auction.getCondition())
                .imageUrl(auction.getImageUrl())
                .startPrice(auction.getStartPrice())
                .currentBid(auction.getCurrentBid())
                .bidCount(auction.getBidCount())
                .endTime(auction.getEndTime())
                .status(auction.getStatus())
                .featured(auction.getFeatured())
                .sellerId(auction.getSeller().getId())
                .seller(mapToUserResponse(auction.getSeller()))
                .createdAt(auction.getCreatedAt())
                .build();
    }

    // Full mapping for detail
    public AuctionResponse mapToAuctionResponseFull(Auction auction) {
        List<BidResponse> bidResponses = new ArrayList<>();
        if (auction.getBids() != null) {
            // Sort bids by createdAt desc, take top 20
            bidResponses = auction.getBids().stream()
                    .sorted((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()))
                    .limit(20)
                    .map(this::mapToBidResponse)
                    .collect(Collectors.toList());
        }

        return AuctionResponse.builder()
                .id(auction.getId())
                .title(auction.getTitle())
                .description(auction.getDescription())
                .category(auction.getCategory())
                .condition(auction.getCondition())
                .imageUrl(auction.getImageUrl())
                .startPrice(auction.getStartPrice())
                .currentBid(auction.getCurrentBid())
                .bidCount(auction.getBidCount())
                .endTime(auction.getEndTime())
                .status(auction.getStatus())
                .featured(auction.getFeatured())
                .platformFee(auction.getPlatformFee())
                .buyerPremium(auction.getBuyerPremium())
                .verificationStatus(auction.getVerificationStatus())
                .verifiedBy(auction.getVerifiedBy())
                .verificationNotes(auction.getVerificationNotes())
                .sellerId(auction.getSeller().getId())
                .seller(mapToUserResponse(auction.getSeller()))
                .bids(bidResponses)
                .createdAt(auction.getCreatedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private BidResponse mapToBidResponse(Bid bid) {
        return BidResponse.builder()
                .id(bid.getId())
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .user(mapToUserResponse(bid.getUser()))
                .build();
    }
}
