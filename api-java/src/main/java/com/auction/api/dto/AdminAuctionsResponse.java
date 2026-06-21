package com.auction.api.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAuctionsResponse {
    private List<AuctionResponse> items;
    private long total;
}
