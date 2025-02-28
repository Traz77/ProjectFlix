package com.example.androidnetflix.data;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverters;
import androidx.room.migration.Migration;
import androidx.sqlite.db.SupportSQLiteDatabase;

import com.example.androidnetflix.data.dao.CategoryDao;
import com.example.androidnetflix.data.dao.MovieDao;
import com.example.androidnetflix.model.entities.Category;
import com.example.androidnetflix.model.entities.Movie;
import com.example.androidnetflix.model.entities.MovieConverter;

@Database(entities = {Movie.class, Category.class}, version = 4)
@TypeConverters({MovieConverter.class})
public abstract class AppDatabase extends RoomDatabase {
    private static volatile AppDatabase instance;

    static final Migration MIGRATION_3_4 = new Migration(3, 4) {
        @Override
        public void migrate(@NonNull SupportSQLiteDatabase database) {
            database.execSQL("ALTER TABLE movies ADD COLUMN movie_file TEXT DEFAULT NULL");
        }
    };


    public abstract MovieDao movieDao();
    public abstract CategoryDao categoryDao();

    public static synchronized AppDatabase getInstance(Context context) {
        if (instance == null) {
            synchronized (AppDatabase.class) {
                if (instance == null) {
                    instance = Room.databaseBuilder(
                                    context.getApplicationContext(),
                                    AppDatabase.class,
                                    "projectflix_database")
                            .addMigrations(MIGRATION_3_4)
                            .build();
                }
            }
        }
        return instance;
    }
}