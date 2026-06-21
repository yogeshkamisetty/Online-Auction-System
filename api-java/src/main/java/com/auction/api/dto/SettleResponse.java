package com.auction.api.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettleResponse {
    private String message;
    private AuctionResponse auction;
    private SettleSummary summary;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SettleSummary {
        private BigDecimal hammerPrice;
        private BigDecimal buyerPremium;
        private BigDecimal totalPaid;
        private BigDecimal sellerReceives;
    }
}
