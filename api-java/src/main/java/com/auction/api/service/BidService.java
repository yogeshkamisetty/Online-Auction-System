package com.auction.api.service;

import com.auction.api.dto.*;
import com.auction.api.entity.Auction;
import com.auction.api.entity.AuctionStatus;
import com.auction.api.entity.Bid;
import com.auction.api.entity.User;
import com.auction.api.repository.AuctionRepository;
import com.auction.api.repository.BidRepository;
import com.auction.api.repository.UserRepository;
import org.springframework.http.HttpStatus;
import com.auction.api.websocket.AuctionWebSocketHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AuctionWebSocketHandler webSocketHandler;

    public BidService(
            BidRepository bidRepository,
            AuctionRepository auctionRepository,
            UserRepository userRepository,
            EmailService emailService,
            AuctionWebSocketHandler webSocketHandler
    ) {
        this.bidRepository = bidRepository;
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.webSocketHandler = webSocketHandler;
    }

    public List<MyBidsResponse> getMyBids(String userId) {
        List<Bid> bids = bidRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bids.stream().map(bid -> {
            Auction auction = bid.getAuction();
            boolean isWinning = bid.getAmount().compareTo(auction.getCurrentBid()) >= 0;

            MyBidsResponse.AuctionInfo info = MyBidsResponse.AuctionInfo.builder()
                    .id(auction.getId())
                    .title(auction.getTitle())
                    .currentBid(auction.getCurrentBid())
                    .status(auction.getStatus())
                    .endTime(auction.getEndTime())
                    .imageUrl(auction.getImageUrl())
                    .build();

            return MyBidsResponse.builder()
                    .id(bid.getId())
                    .amount(bid.getAmount())
                    .createdAt(bid.getCreatedAt())
                    .isWinning(isWinning)
                    .auction(info)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public BidResponse placeBid(String userId, PlaceBidRequest request) {
        // Pessimistic locking to avoid concurrent bid collisions
        Auction auction = auctionRepository.findByIdForUpdate(request.getAuctionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        if (auction.getStatus() != AuctionStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Auction is not active");
        }

        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Auction has ended");
        }

        if (request.getAmount().compareTo(auction.getCurrentBid()) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Bid must be higher than current bid of $" + auction.getCurrentBid());
        }

        User bidder = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Get previous highest bid to notify outbid
        List<Bid> existingBids = bidRepository.findByAuctionIdOrderByCreatedAtDesc(auction.getId());
        Bid previousHighestBid = existingBids.isEmpty() ? null : existingBids.get(0);

        Bid bid = Bid.builder()
                .auction(auction)
                .user(bidder)
                .amount(request.getAmount())
                .build();

        bid = bidRepository.save(bid);

        // Update auction
        auction.setCurrentBid(request.getAmount());
        auction.setBidCount(auction.getBidCount() + 1);
        auctionRepository.save(auction);

        // Broadcast to WebSocket clients
        Map<String, Object> wsPayload = new HashMap<>();
        wsPayload.put("auctionId", auction.getId());
        wsPayload.put("currentBid", auction.getCurrentBid());
        wsPayload.put("bidCount", auction.getBidCount());
        wsPayload.put("bidder", bidder.getName());
        wsPayload.put("amount", bid.getAmount());
        wsPayload.put("createdAt", bid.getCreatedAt().toString());

        // Send to websocket clients in the auction room
        webSocketHandler.broadcastToRoom(auction.getId(), "bid:new", wsPayload);

        // Notify previous outbid user
        if (previousHighestBid != null && !previousHighestBid.getUser().getId().equals(userId)) {
            final User prevUser = previousHighestBid.getUser();
            final String title = auction.getTitle();
            final String auctionId = auction.getId();
            final String currentBidStr = auction.getCurrentBid().toString();

            new Thread(() -> {
                try {
                    String html = "<div style=\"font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;\">" +
                            "<h2 style=\"color: #b91c1c;\">You have been outbid!</h2>" +
                            "<p>Hello <strong>" + prevUser.getName() + "</strong>,</p>" +
                            "<p>Another bidder placed a higher bid on <strong>" + title + "</strong>.</p>" +
                            "<div style=\"background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #f3f4f6;\">" +
                            "<p style=\"margin: 0;\">New Highest Bid: <strong style=\"font-size: 1.2rem; color: #111827;\">$" + currentBidStr + "</strong></p>" +
                            "</div>" +
                            "<p>Don't lose this treasure! Reclaim your lead by placing a higher bid.</p>" +
                            "<div style=\"text-align: center; margin: 30px 0;\">" +
                            "<a href=\"http://localhost:5173/product/" + auctionId + "\" style=\"background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">" +
                            "Place a Higher Bid &rarr;" +
                            "</a>" +
                            "</div>" +
                            "<p style=\"color: #6b7280; font-size: 0.85rem;\">Golden Hammer Auctions. Keep winning.</p>" +
                            "</div>";
                    emailService.sendEmail(prevUser.getEmail(), "⚠️ Outbid Warning: " + title, html);
                } catch (Exception e) {
                    System.err.println("Outbid notification email failed: " + e.getMessage());
                }
            }).start();
        }

        return BidResponse.builder()
                .id(bid.getId())
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .user(UserResponse.builder()
                        .id(bidder.getId())
                        .name(bidder.getName())
                        .email(bidder.getEmail())
                        .role(bidder.getRole())
                        .build())
                .build();
    }
}
