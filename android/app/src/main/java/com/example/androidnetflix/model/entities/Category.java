package com.example.androidnetflix.model.entities;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;
import androidx.room.TypeConverters;

import com.google.gson.annotations.SerializedName;

import java.util.List;

@Entity(tableName = "categories")
public class Category {
    @PrimaryKey
    @NonNull
    @SerializedName("_id")
    @ColumnInfo(name = "_id")
    private String categoryId = "";

    @SerializedName("name")
    @ColumnInfo(name = "name")
    private String name ;
    @SerializedName("promoted")
    @ColumnInfo(name = "promoted")
    private boolean promoted;
    @SerializedName("movies")
    @TypeConverters(MovieConverter.class)
    private List<Movie> movies;

    public Category() {}

    public String getId() {
        return categoryId;
    }

    public void setId(String id) {
        if (id != null && !id.isEmpty()) {
            this.categoryId = id;
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isPromoted() {
        return promoted;
    }

    public void setPromoted(boolean promoted) {
        this.promoted = promoted;
    }

    public List<Movie> getMovies() {
        return movies;
    }

    public void setMovies(List<Movie> movies) {
        this.movies = movies;
    }

    @NonNull
    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        setId(categoryId);
    }

    public String getCategoryName() {
        return name;
    }

    public void setCategoryName(String categoryName) {
        setName(categoryName);
    }
}