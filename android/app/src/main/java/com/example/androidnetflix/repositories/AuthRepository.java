package com.example.androidnetflix.repositories;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.androidnetflix.R;
import com.example.androidnetflix.data.api.AuthApi;
import com.example.androidnetflix.model.entities.Token;
import com.example.androidnetflix.model.entities.User;
import com.google.gson.Gson;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

// Validate login operation
public class AuthRepository {

    private final AuthApi api;
    private final Context context;

    public AuthRepository(Context context) {
        this.context = context;

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(context.getString(R.string.api_url))
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        api = retrofit.create(AuthApi.class);
    }

    // Creating a user, getting the token, and saving it
    public void loginUser(String email, String password, LoginAnswer callback) {
        User user = new User(email, password);
        Log.d("LoginRequest", "Request Body: " + new Gson().toJson(user));
        api.loginUser(user)
                .enqueue(new Callback<>() {
                    @Override
                    public void onResponse(@NonNull Call<Token> call, @NonNull Response<Token> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            String token = response.body().getToken();
                            saveToken(token);
                            callback.onSuccess(token);
                        } else {
                            callback.onError("Invalid Email / Password");
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<Token> call, @NonNull Throwable problem) {
                        callback.onError("Network error: " + problem.getMessage());
                    }
                });
    }

    // Save the token for further use
    private void saveToken(String token) {
        SharedPreferences sharedPreferences = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("auth_token", token);
        editor.apply();
    }

    public interface LoginAnswer {

        void onSuccess(String token);

        void onError(String error);
    }
}