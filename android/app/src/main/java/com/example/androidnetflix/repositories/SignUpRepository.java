package com.example.androidnetflix.repositories;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;

import com.example.androidnetflix.R;
import com.example.androidnetflix.data.api.UsersApi;
import com.example.androidnetflix.model.entities.User;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class SignUpRepository {

    private static Context context;
    private static UsersApi api;

    public SignUpRepository(Context context) {
        this.context = context;
        if (api == null) {
            Retrofit retrofit = new Retrofit.Builder()
                    .baseUrl(context.getString(R.string.api_url))
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();

            api = retrofit.create(UsersApi.class);
        }
    }

    public interface SignUpCallback {

        void onSignUpSuccess();

        void onSignUpFailure(String errorMessage);
    }

    public static void signUp(String email, String password, String firstName, String lastName, SignUpCallback callback) {
        if (api == null) {
            return;
        }
        // Creates the user
        User user = new User(email, password, firstName, lastName);

        // Calling the server to create the user
        api.createUser(user).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<User> call, @NonNull Response<User> response) {
                if (response.isSuccessful() && response.body() != null) {
                    callback.onSignUpSuccess();
                } else {
                    String errorMessage;
                    try {
                        errorMessage = response.errorBody() != null
                                ? response.errorBody().string() : "Sign Up failed";
                    } catch (Exception e) {
                        errorMessage = "Sign Up failed: " + response.message();
                    }
                    callback.onSignUpFailure(errorMessage);
                }
            }

            @Override
            public void onFailure(@NonNull Call<User> call, @NonNull Throwable t) {
                String error = "Network Error: " + t.getMessage();
                Log.e("SignUpRepository", error);
                callback.onSignUpFailure(error);
            }
        });
    }
}