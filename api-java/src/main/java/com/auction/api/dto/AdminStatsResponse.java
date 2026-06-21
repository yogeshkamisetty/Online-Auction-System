package com.auction.api.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {
    private long users;
    private AuctionsStats auctions;
    private long bids;
    private long pendingVerification;
    private BigDecimal gmv;
    private BigDecimal platformRevenue;
    private double bidToListingRatio;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuctionsStats {
        private long total;
        private long active;
        private long closed;
        private long settled;
    }
}
