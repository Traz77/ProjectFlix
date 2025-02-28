package com.example.androidnetflix.model.converters;

import com.example.androidnetflix.model.entities.Movie;
import java.util.List;

public class SearchResponse {
    private List<Movie> movies;

    public List<Movie> getMovies() {
        return movies;
    }

    public void setMovies(List<Movie> movies) {
        this.movies = movies;
    }
}