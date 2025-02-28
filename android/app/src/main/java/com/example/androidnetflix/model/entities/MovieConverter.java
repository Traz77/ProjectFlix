package com.example.androidnetflix.model.entities;

import androidx.room.TypeConverter;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.List;

// In order to use room, we need to convert the object into a string, and make it a movie again when needed.
public class MovieConverter {
    @TypeConverter
    public static String fromMovieList(List<Movie> movies) {
        if (movies == null) {
            return null;
        }
        Gson gson = new Gson();
        return gson.toJson(movies);
    }

    @TypeConverter
    public static List<Movie> toMovieList(String moviesString) {
        if (moviesString == null) {
            return null;
        }
        Gson gson = new Gson();
        Type listType = new TypeToken<List<Movie>>() {}.getType();
        return gson.fromJson(moviesString, listType);
    }
    @TypeConverter
    public static String fromStringList(List<String> list) {
        if (list == null) {
            return null;
        }
        Gson gson = new Gson();
        return gson.toJson(list);
    }

    @TypeConverter
    public static List<String> toStringList(String listString) {
        if (listString == null) {
            return null;
        }
        Gson gson = new Gson();
        Type listType = new TypeToken<List<String>>() {}.getType();
        return gson.fromJson(listString, listType);
    }
}
