package com.example.androidnetflix.data.api;

import com.example.androidnetflix.model.entities.Token;
import com.example.androidnetflix.model.entities.User;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

// Post on api tokens return the Token of the user - for his username and password
public interface AuthApi {
    @POST("tokens")
    Call<Token> loginUser(@Body User user);
}
