package com.example.androidnetflix.model.converters;

import com.example.androidnetflix.model.entities.Category;
import com.example.androidnetflix.model.entities.Movie;
import com.google.gson.annotations.SerializedName;
import java.util.List;

public class CategoryResponse {
    @SerializedName("categoryName")
    private String categoryName;

    @SerializedName("categoryId")
    private String categoryId;

    @SerializedName("movies")
    private List<Movie> movies;

    // Create the category in the correct structure
    public Category toCategory() {
        Category category = new Category();
        category.setId(categoryId);
        category.setName(categoryName);
        category.setMovies(movies);
        return category;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public List<Movie> getMovies() {
        return movies;
    }

    public void setMovies(List<Movie> movies) {
        this.movies = movies;
    }
}