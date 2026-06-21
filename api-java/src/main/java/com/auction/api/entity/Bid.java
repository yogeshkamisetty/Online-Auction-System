package com.auction.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "\"Bid\"")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "userId", nullable = false, insertable = false, updatable = false)
    private String userId;

    @Column(name = "auctionId", nullable = false, insertable = false, updatable = false)
    private String auctionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auctionId", nullable = false)
    private Auction auction;
}
