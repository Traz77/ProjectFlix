package com.example.androidnetflix.data.api;

import com.example.androidnetflix.model.entities.Category;
import com.example.androidnetflix.model.entities.Movie;

import java.util.List;
import java.util.Map;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.Header;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface AdminApi {
    @POST("movies")
    Call<Movie> createMovie(@Header("Authorization") String token, @Body Map<String, Object> requestBody);

    @PUT("movies/{id}")
    Call<Movie> updateMovie(@Header("Authorization") String token, @Path("id") String id, @Body Map<String, Object> movie);

    @DELETE("movies/{id}")
    Call<Void> deleteMovie(@Header("Authorization") String token, @Path("id") String id);

    @POST("categories")
    Call<ResponseBody> createCategory(@Header("Authorization") String token, @Body Map<String, Object> categoryData);
    @DELETE("categories/{id}")
    Call<Void> deleteCategory(@Header("Authorization") String token, @Path("id") String id);

    @GET("categories")
    Call<List<Category>> getAllCategories(@Header("Authorization") String token);

}