package com.example.androidnetflix.viewmodel;

import android.app.Application;

import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.example.androidnetflix.model.entities.Category;
import com.example.androidnetflix.repositories.MovieRepository;

import java.util.List;

public class MovieViewModel extends AndroidViewModel {
    private final MovieRepository repository;
    private final LiveData<List<Category>> allCategories;
    public MovieViewModel(Application application) {
        super(application);
        repository = new MovieRepository(application);
        allCategories = repository.getAllCategories();
    }

    public void insertCategories(List<Category> categories) {
        repository.insertCategories(categories);
    }

    public LiveData<List<Category>> getAllCategories() {
        return allCategories;
    }

}