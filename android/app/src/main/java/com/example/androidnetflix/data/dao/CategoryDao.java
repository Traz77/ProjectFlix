package com.example.androidnetflix.data.dao;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Transaction;

import com.example.androidnetflix.model.entities.Category;

import java.util.List;

@Dao
public interface CategoryDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertCategories(List<Category> categories);

    @Transaction
    default void replaceAllCategories(List<Category> categories) {
        deleteAllCategories();
        insertCategories(categories);
    }

    @Query("SELECT * FROM categories WHERE _id = :categoryId")
    Category getCategoryById(String categoryId);


    @Query("SELECT * FROM categories")
    LiveData<List<Category>> getAllCategoriesLive();

    @Query("DELETE FROM categories")
    void deleteAllCategories();
}