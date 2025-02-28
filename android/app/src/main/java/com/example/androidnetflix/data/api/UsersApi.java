package com.example.androidnetflix.data.api;

import com.example.androidnetflix.model.entities.User;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;


public interface UsersApi {
    @POST("users")
    Call<User> createUser(@Body User user);
}
