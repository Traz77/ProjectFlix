package com.example.androidnetflix.model.entities;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.io.Serializable;
import java.util.List;
import java.util.Objects;

@Entity(tableName = "movies")
public class Movie implements Serializable {
    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "movie_id")
    private String _id = "Watched Movies";

    public Movie()  {}

    public Movie(@NonNull String _id, String name, int duration, int year, String description,
                 String director, List<String> cast, String mainImage,
                 List<String> images) {
        this._id = _id;
        this.name = name;
        this.duration = duration;
        this.year = year;
        this.description = description;
        this.director = director;
        this.cast = cast;
        this.mainImage = mainImage;
        this.images = images;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Movie movie = (Movie) o;
        return Objects.equals(_id, movie._id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(_id);
    }

    @ColumnInfo(name = "name")
    private String name;

    @ColumnInfo(name = "duration")
    private int duration;

    @ColumnInfo(name = "year")
    private int year;

    @ColumnInfo(name = "description")
    private String description;

    @ColumnInfo(name = "director")
    private String director;

    @ColumnInfo(name = "cast")
    private List<String> cast;

    @ColumnInfo(name = "main_image")
    private String mainImage;

    @ColumnInfo(name = "images")
    private List<String> images;

    @ColumnInfo(name = "movie_file")
    private String movieFile;


    public String getId() {
        return _id;
    }

    public void setId(String id) {
        this._id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getDuration() {
        return duration;
    }

    public void setDuration(int duration) {
        this.duration = duration;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public List<String> getCast() {
        return cast;
    }

    public void setCast(List<String> cast) {
        this.cast = cast;
    }

    public String getMainImage() {
        return mainImage;
    }

    public void setMainImage(String mainImage) {
        this.mainImage = mainImage;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public String getMovieFile() {
        return movieFile;
    }

    public void setMovieFile(String movieFile) {
        this.movieFile = movieFile;
    }

    @NonNull
    @Override
    public String toString() {
        return "Movie{" +
                "_id=" + _id +
                ", name='" + name + '\'' +
                ", year=" + year +
                ", mainImage='" + mainImage + '\'' +
                '}';
    }


}

