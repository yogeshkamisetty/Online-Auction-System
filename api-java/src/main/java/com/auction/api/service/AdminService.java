package com.auction.api.service;

import com.auction.api.dto.*;
import com.auction.api.entity.*;
import com.auction.api.repository.AuctionRepository;
import com.auction.api.repository.BidRepository;
import com.auction.api.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final AuctionService auctionService;

    public AdminService(
            UserRepository userRepository,
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            AuctionService auctionService
    ) {
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.auctionService = auctionService;
    }

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalAuctions = auctionRepository.count();
        long activeAuctions = auctionRepository.countByStatus(AuctionStatus.ACTIVE);
        long closedAuctions = auctionRepository.countByStatus(AuctionStatus.CLOSED);
        long settledAuctions = auctionRepository.countByStatus(AuctionStatus.SETTLED);
        long totalBids = bidRepository.count();
        long pendingVerification = auctionRepository.countByVerificationStatus(VerificationStatus.PENDING);

        BigDecimal gmv = auctionRepository.sumCurrentBidByStatus(AuctionStatus.SETTLED);
        if (gmv == null) gmv = BigDecimal.ZERO;

        BigDecimal totalPlatformFee = auctionRepository.sumPlatformFeeByStatus(AuctionStatus.SETTLED);
        BigDecimal totalBuyerPremium = auctionRepository.sumBuyerPremiumByStatus(AuctionStatus.SETTLED);

        if (totalPlatformFee == null) totalPlatformFee = BigDecimal.ZERO;
        if (totalBuyerPremium == null) totalBuyerPremium = BigDecimal.ZERO;

        BigDecimal platformRevenue = totalPlatformFee.add(totalBuyerPremium);

        double bidToListingRatio = 0.0;
        if (totalAuctions > 0) {
            bidToListingRatio = BigDecimal.valueOf(totalBids)
                    .divide(BigDecimal.valueOf(totalAuctions), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        AdminStatsResponse.AuctionsStats auctionsStats = AdminStatsResponse.AuctionsStats.builder()
                .total(totalAuctions)
                .active(activeAuctions)
                .closed(closedAuctions)
                .settled(settledAuctions)
                .build();

        return AdminStatsResponse.builder()
                .users(totalUsers)
                .auctions(auctionsStats)
                .bids(totalBids)
                .pendingVerification(pendingVerification)
                .gmv(gmv)
                .platformRevenue(platformRevenue)
                .bidToListingRatio(bidToListingRatio)
                .build();
    }

    public AdminAuctionsResponse getAuctions(String statusStr, String verificationStatusStr, String search, int take, int skip) {
        // Enforce maximum pageSize of 100
        int pageSize = Math.min(take, 100);
        int pageNumber = skip / pageSize;

        Specification<Auction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (statusStr != null && !statusStr.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("status"), AuctionStatus.valueOf(statusStr.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (verificationStatusStr != null && !verificationStatusStr.isEmpty()) {
                try {
                    predicates.add(cb.equal(root.get("verificationStatus"), VerificationStatus.valueOf(verificationStatusStr.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = cb.like(cb.lower(root.get("title")), likePattern);
                Predicate descPredicate = cb.like(cb.lower(root.get("description")), likePattern);
                predicates.add(cb.or(titlePredicate, descPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Auction> page = auctionRepository.findAll(spec, pageable);

        List<AuctionResponse> items = page.getContent().stream()
                .map(auctionService::mapToAuctionResponseLight)
                .collect(Collectors.toList());

        return AdminAuctionsResponse.builder()
                .items(items)
                .total(page.getTotalElements())
                .build();
    }

    public AuctionResponse updateAuction(String id, UpdateAuctionAdminRequest request) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        if (request.getStatus() != null) {
            try {
                auction.setStatus(AuctionStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
            }
        }

        if (request.getFeatured() != null) {
            auction.setFeatured(request.getFeatured());
        }

        if (request.getTitle() != null) {
            auction.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            auction.setDescription(request.getDescription());
        }

        auction = auctionRepository.save(auction);
        return auctionService.mapToAuctionResponseFull(auction);
    }

    @Transactional
    public void deleteAuction(String id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        // Delete bids manually to prevent FK constraint failures
        List<Bid> bids = bidRepository.findByAuctionIdOrderByCreatedAtDesc(id);
        bidRepository.deleteAll(bids);

        // Delete auction
        auctionRepository.delete(auction);
    }

    public AuctionResponse verifyAuction(String id, String verifierEmail, VerifyAuctionRequest request) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        VerificationStatus status;
        try {
            status = VerificationStatus.valueOf(request.getVerificationStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification status");
        }

        auction.setVerificationStatus(status);
        auction.setVerificationNotes(request.getVerificationNotes());
        auction.setVerifiedBy(status == VerificationStatus.VERIFIED ? verifierEmail : null);

        auction = auctionRepository.save(auction);
        return auctionService.mapToAuctionResponseFull(auction);
    }

    public AdminUsersResponse getUsers(String search, int take, int skip) {
        int pageSize = Math.min(take, 100);
        int pageNumber = skip / pageSize;

        Specification<User> spec = (root, query, cb) -> {
            if (search != null && !search.isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("name")), likePattern);
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), likePattern);
                return cb.or(namePredicate, emailPredicate);
            }
            return null;
        };

        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> page = userRepository.findAll(spec, pageable);

        List<AdminUsersResponse.AdminUserItem> items = page.getContent().stream().map(user -> {
            AdminUsersResponse.UserCounts counts = AdminUsersResponse.UserCounts.builder()
                    .auctions(user.getAuctions() != null ? user.getAuctions().size() : 0)
                    .bids(user.getBids() != null ? user.getBids().size() : 0)
                    .build();

            return AdminUsersResponse.AdminUserItem.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .suspended(user.getSuspended())
                    .createdAt(user.getCreatedAt())
                    .count(counts)
                    .build();
        }).collect(Collectors.toList());

        return AdminUsersResponse.builder()
                .items(items)
                .total(page.getTotalElements())
                .build();
    }

    public UserResponse updateUser(String currentUserId, String targetUserId, UpdateUserAdminRequest request) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Guard: an admin cannot suspend or demote themselves
        if (currentUserId.equals(targetUserId)) {
            boolean demoting = request.getRole() != null && "USER".equalsIgnoreCase(request.getRole());
            boolean suspending = request.getSuspended() != null && request.getSuspended();
            if (demoting || suspending) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot suspend or demote your own account");
            }
        }

        if (request.getSuspended() != null) {
            targetUser.setSuspended(request.getSuspended());
        }

        if (request.getRole() != null) {
            try {
                targetUser.setRole(Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
            }
        }

        targetUser = userRepository.save(targetUser);
        return UserResponse.builder()
                .id(targetUser.getId())
                .name(targetUser.getName())
                .email(targetUser.getEmail())
                .role(targetUser.getRole())
                .build();
    }

    public List<BidResponse> getAuctionBids(String auctionId) {
        List<Bid> bids = bidRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId);
        return bids.stream().map(bid -> BidResponse.builder()
                .id(bid.getId())
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .user(UserResponse.builder()
                        .id(bid.getUser().getId())
                        .name(bid.getUser().getName())
                        .email(bid.getUser().getEmail())
                        .role(bid.getUser().getRole())
                        .build())
                .build()).collect(Collectors.toList());
    }
}
