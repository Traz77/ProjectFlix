package com.example.androidnetflix.repositories;

import android.app.Application;

import androidx.lifecycle.LiveData;

import com.example.androidnetflix.data.dao.CategoryDao;
import com.example.androidnetflix.data.AppDatabase;
import com.example.androidnetflix.model.entities.Category;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MovieRepository {
    private final CategoryDao categoryDao;
    private final ExecutorService executorService;

    public MovieRepository(Application application) {
        AppDatabase db = AppDatabase.getInstance(application);
        db.movieDao();
        categoryDao = db.categoryDao();
        // should handle the data base operations
        executorService = Executors.newFixedThreadPool(4);
    }

    public void insertCategories(List<Category> categories) {
        // To refresh categories after insert
        executorService.execute(() -> categoryDao.replaceAllCategories(categories));
    }

    public LiveData<List<Category>> getAllCategories() {
        return categoryDao.getAllCategoriesLive();
    }
}