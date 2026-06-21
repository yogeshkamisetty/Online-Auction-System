package com.auction.api.job;

import com.auction.api.entity.Auction;
import com.auction.api.entity.AuctionStatus;
import com.auction.api.entity.Bid;
import com.auction.api.entity.User;
import com.auction.api.repository.AuctionRepository;
import com.auction.api.service.EmailService;
import com.auction.api.websocket.AuctionWebSocketHandler;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AuctionCloserJob {

    private final AuctionRepository auctionRepository;
    private final EmailService emailService;
    private final AuctionWebSocketHandler webSocketHandler;

    public AuctionCloserJob(
            AuctionRepository auctionRepository,
            EmailService emailService,
            AuctionWebSocketHandler webSocketHandler
    ) {
        this.auctionRepository = auctionRepository;
        this.emailService = emailService;
        this.webSocketHandler = webSocketHandler;
    }

    @Scheduled(cron = "0 * * * * *")
    public void closeExpiredAuctions() {
        try {
            List<Auction> expired = auctionRepository.findByStatusAndEndTimeBefore(
                    AuctionStatus.ACTIVE,
                    LocalDateTime.now()
            );

            if (expired.isEmpty()) {
                return;
            }

            for (Auction auction : expired) {
                auction.setStatus(AuctionStatus.CLOSED);
                auctionRepository.save(auction);

                // Broadcast WebSocket event using raw WebSocket handler
                Map<String, Object> wsPayload = new HashMap<>();
                wsPayload.put("auctionId", auction.getId());
                webSocketHandler.broadcastToRoom(auction.getId(), "auction:closed", wsPayload);

                System.out.println("[cron] Closed auction: " + auction.getTitle() + " (" + auction.getId() + ")");

                // Find highest bid
                List<Bid> bids = auction.getBids();
                Bid winningBid = null;
                if (bids != null && !bids.isEmpty()) {
                    winningBid = bids.stream()
                            .max((b1, b2) -> b1.getAmount().compareTo(b2.getAmount()))
                            .orElse(null);
                }

                User seller = auction.getSeller();

                if (winningBid != null) {
                    User winner = winningBid.getUser();
                    final String title = auction.getTitle();
                    final String auctionId = auction.getId();
                    final String winningAmountStr = winningBid.getAmount().toString();

                    // Email to winner
                    final String winnerEmail = winner.getEmail();
                    final String winnerName = winner.getName();
                    new Thread(() -> {
                        String html = "<div style=\"font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;\">" +
                                "<h2 style=\"color: #166534; margin-top: 0;\">You Won the Auction!</h2>" +
                                "<p>Hello <strong>" + winnerName + "</strong>,</p>" +
                                "<p>Congratulations! You are the highest bidder for <strong>" + title + "</strong>.</p>" +
                                "<div style=\"background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #dcfce7;\">" +
                                "<p style=\"margin: 0; color: #166534; font-size: 1.1rem;\">Your Winning Bid: <strong style=\"font-size: 1.3rem; color: #14532d;\">$" + winningAmountStr + "</strong></p>" +
                                "</div>" +
                                "<p>Please log in to confirm your purchase, check your invoice summary, and settle the payment.</p>" +
                                "<div style=\"text-align: center; margin: 30px 0;\">" +
                                "<a href=\"http://localhost:5173/product/" + auctionId + "\" style=\"background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">" +
                                "Settle Payment &rarr;" +
                                "</a>" +
                                "</div>" +
                                "<p style=\"color: #6b7280; font-size: 0.85rem; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;\">Golden Hammer Auctions. Thank you for your business!</p>" +
                                "</div>";
                        emailService.sendEmail(winnerEmail, "🏆 Congratulations! You won: " + title, html);
                    }).start();

                    // Email to seller
                    final String sellerEmail = seller.getEmail();
                    final String sellerName = seller.getName();
                    new Thread(() -> {
                        String html = "<div style=\"font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;\">" +
                                "<h2 style=\"color: #1e3a8a; margin-top: 0;\">Item Sold!</h2>" +
                                "<p>Hello <strong>" + sellerName + "</strong>,</p>" +
                                "<p>Your listing <strong>" + title + "</strong> has closed with a winning bid.</p>" +
                                "<div style=\"background-color: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #dbeafe;\">" +
                                "<p style=\"margin: 0; color: #1e40af; font-size: 1.1rem;\">Final Hammer Price: <strong style=\"font-size: 1.3rem; color: #1e3a8a;\">$" + winningAmountStr + "</strong></p>" +
                                "</div>" +
                                "<p>We have notified the buyer to settle their payment. Once completed, your funds will be released (less platform fees).</p>" +
                                "<p style=\"color: #6b7280; font-size: 0.85rem; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;\">Golden Hammer Auctions. Sell with confidence.</p>" +
                                "</div>";
                        emailService.sendEmail(sellerEmail, "💰 Your item has sold: " + title, html);
                    }).start();

                } else {
                    // No bids - notify seller of unsold item
                    final String sellerEmail = seller.getEmail();
                    final String sellerName = seller.getName();
                    final String title = auction.getTitle();
                    new Thread(() -> {
                        String html = "<div style=\"font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;\">" +
                                "<h2 style=\"color: #4b5563; margin-top: 0;\">Auction Ended (Unsold)</h2>" +
                                "<p>Hello <strong>" + sellerName + "</strong>,</p>" +
                                "<p>Your listing <strong>" + title + "</strong> has ended, but did not receive any bids.</p>" +
                                "<p>You can re-list the item at any time with a lower starting price or longer duration to attract buyers.</p>" +
                                "<div style=\"text-align: center; margin: 30px 0;\">" +
                                "<a href=\"http://localhost:5173/sell\" style=\"background-color: #1f2937; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;\">" +
                                "Re-List Item &rarr;" +
                                "</a>" +
                                "</div>" +
                                "<p style=\"color: #6b7280; font-size: 0.85rem; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px;\">Golden Hammer Auctions.</p>" +
                                "</div>";
                        emailService.sendEmail(sellerEmail, "⌛ Auction ended (No Bids): " + title, html);
                    }).start();
                }
            }
        } catch (Exception err) {
            System.err.println("[cron] auctionCloser error: " + err.getMessage());
        }
    }
}
