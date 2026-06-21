package com.auction.api.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WatchlistResponse {
    private String id;
    private String userId;
    private String auctionId;
    private LocalDateTime createdAt;
}
