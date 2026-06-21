package com.auction.api.dto;

import com.auction.api.entity.AuctionStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyBidsResponse {
    private String id;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private Boolean isWinning;
    private AuctionInfo auction;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuctionInfo {
        private String id;
        private String title;
        private BigDecimal currentBid;
        private AuctionStatus status;
        private LocalDateTime endTime;
        private String imageUrl;
    }
}
