package com.auction.api.repository;

import com.auction.api.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, String> {
    List<Bid> findByAuctionIdOrderByCreatedAtDesc(String auctionId);
    List<Bid> findByUserIdOrderByCreatedAtDesc(String userId);
}
