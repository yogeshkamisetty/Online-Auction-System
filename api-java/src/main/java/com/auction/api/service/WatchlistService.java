package com.auction.api.service;

import com.auction.api.dto.AuctionResponse;
import com.auction.api.dto.WatchlistResponse;
import com.auction.api.entity.Auction;
import com.auction.api.entity.User;
import com.auction.api.entity.Watchlist;
import com.auction.api.repository.AuctionRepository;
import com.auction.api.repository.UserRepository;
import com.auction.api.repository.WatchlistRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;
    private final AuctionService auctionService;

    public WatchlistService(
            WatchlistRepository watchlistRepository,
            AuctionRepository auctionRepository,
            UserRepository userRepository,
            AuctionService auctionService
    ) {
        this.watchlistRepository = watchlistRepository;
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.auctionService = auctionService;
    }

    public List<AuctionResponse> getWatchlist(String userId) {
        List<Watchlist> watchlisted = watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return watchlisted.stream()
                .map(w -> auctionService.mapToAuctionResponseLight(w.getAuction()))
                .collect(Collectors.toList());
    }

    public WatchlistResponse addToWatchlist(String userId, String auctionId) {
        // Check if already in watchlist
        if (watchlistRepository.findByUserIdAndAuctionId(userId, auctionId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Auction is already in your watchlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found"));

        Watchlist watchlist = Watchlist.builder()
                .user(user)
                .auction(auction)
                .build();

        watchlist = watchlistRepository.save(watchlist);

        return WatchlistResponse.builder()
                .id(watchlist.getId())
                .userId(watchlist.getUser().getId())
                .auctionId(watchlist.getAuction().getId())
                .createdAt(watchlist.getCreatedAt())
                .build();
    }

    public void removeFromWatchlist(String userId, String auctionId) {
        Watchlist watchlist = watchlistRepository.findByUserIdAndAuctionId(userId, auctionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not in watchlist"));

        watchlistRepository.delete(watchlist);
    }
}
