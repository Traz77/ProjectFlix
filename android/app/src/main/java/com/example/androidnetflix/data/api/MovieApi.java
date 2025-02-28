package com.example.androidnetflix.data.api;

import com.example.androidnetflix.model.converters.CategoryResponse;
import com.example.androidnetflix.model.converters.SearchResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.Path;

public interface MovieApi {
    // Get all categories with 20 movies of each category, randomly, and only those the user hasn't watched yet.
    // Also return a special category of the last 20 movies watched by the user
    @GET("movies")
    Call<List<CategoryResponse>> getAllMovies(@Header("Authorization") String token);

    @GET("movies/search/{query}")
    Call<SearchResponse> searchMovies(@Path("query") String query);
}