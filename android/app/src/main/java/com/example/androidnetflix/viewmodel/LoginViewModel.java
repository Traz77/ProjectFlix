package com.example.androidnetflix.viewmodel;

import android.app.Application;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.example.androidnetflix.repositories.AuthRepository;

public class LoginViewModel extends AndroidViewModel {
    private final AuthRepository repository;
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoggedIn = new MutableLiveData<>();
    private final MutableLiveData<String> authToken = new MutableLiveData<>();

    public LoginViewModel(Application application) {
        super(application);
        repository = new AuthRepository(application);
    }

    public void login(String email, String password) {
        repository.loginUser(email, password, new AuthRepository.LoginAnswer() {
            @Override
            public void onSuccess(String token) {
                isLoggedIn.setValue(true);
                authToken.setValue(token);
                errorMessage.setValue(null);
            }

            @Override
            public void onError(String error) {
                isLoggedIn.setValue(false);
                errorMessage.setValue(error);
            }
        });
    }

    public LiveData<String> getError() {
        return errorMessage;
    }

    public LiveData<Boolean> getIsLoggedIn() {
        return isLoggedIn;
    }

}
