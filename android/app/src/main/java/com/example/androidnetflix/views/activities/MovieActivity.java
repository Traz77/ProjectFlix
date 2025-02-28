package com.example.androidnetflix.views.activities;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidnetflix.R;
import com.example.androidnetflix.data.api.MovieApi;
import com.example.androidnetflix.model.entities.Category;
import com.example.androidnetflix.model.entities.Movie;
import com.example.androidnetflix.model.converters.CategoryResponse;
import com.example.androidnetflix.model.converters.SearchResponse;
import com.example.androidnetflix.viewmodel.MovieViewModel;
import com.example.androidnetflix.views.adapters.MovieAdapter;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MovieActivity extends AppCompatActivity {
    private RecyclerView recyclerView;
    private MovieAdapter movieAdapter;
    private MovieApi categoryApi;
    private MovieViewModel movieViewModel;
    private String authToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_movie);
        movieViewModel = new ViewModelProvider(this).get(MovieViewModel.class);
        setupToolbar();
        setupViews();
        initializeMovieList();
        setupRetrofit();
        setupAuthAndFetchMovies();
        movieViewModel.getAllCategories().observe(this, categories -> {
            if (categories != null && !categories.isEmpty()) {
                updateUI(categories);
            }
        });
        setupSearchView ();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Refresh data when activity resumes
        if (authToken != null) {
            fetchMovies(authToken);
        }
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayShowTitleEnabled(false);
        }
    }
    private void setupSearchView() {
        SearchView searchView = findViewById(R.id.search_view);
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                if (!query.isEmpty()) {
                    performSearch(query);
                }
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                if (newText.isEmpty()) {
                    restoreCategories();
                } else if (newText.length() >= 3) {
                    performSearch(newText);
                }
                return true;
            }
        });

        searchView.setOnCloseListener(() -> {
            restoreCategories();
            return false;
        });
    }

    private void restoreCategories() {
        List<Category> currentCategories = movieViewModel.getAllCategories().getValue();
        if (currentCategories != null && !currentCategories.isEmpty()) {
            movieAdapter = new MovieAdapter(this, this::onMovieClick);
            recyclerView.setAdapter(movieAdapter);
            updateUI(currentCategories);
        } else {
            setupAuthAndFetchMovies();
        }
    }

    private void performSearch(String query) {
        categoryApi.searchMovies(query).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<SearchResponse> call, @NonNull Response<SearchResponse> response) {

                if (response.isSuccessful()) {
                    SearchResponse searchResponse = response.body();
                    List<Movie> searchResults = searchResponse != null ? searchResponse.getMovies() : new ArrayList<>();
                    updateUIWithSearchResults(searchResults);
                } else {
                    updateUIWithSearchResults(new ArrayList<>());
                }
            }

            @Override
            public void onFailure(@NonNull Call<SearchResponse> call, @NonNull Throwable t) {
                Log.e("MovieActivity", "Search network failure", t);
                updateUIWithSearchResults(new ArrayList<>());
            }
        });
    }

    private void updateUIWithSearchResults(List<Movie> searchResults) {
        if (searchResults == null || searchResults.isEmpty()) {
            recyclerView.setAdapter(null);
            Toast.makeText(this, "No movies found matching your search", Toast.LENGTH_SHORT).show();
        } else {
            MovieAdapter searchAdapter = new MovieAdapter(this, searchResults, this::onMovieClick);
            recyclerView.setAdapter(searchAdapter);
        }
    }

    private void setupViews() {
        recyclerView = findViewById(R.id.categories_container);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        movieAdapter = new MovieAdapter(this, this::onMovieClick);
        recyclerView.setAdapter(movieAdapter);
    }

    private void initializeMovieList() {
        movieAdapter = new MovieAdapter(this, this::onMovieClick);
        recyclerView.setAdapter(movieAdapter);
    }

    private void setupRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(getString(R.string.api_url))
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        categoryApi = retrofit.create(MovieApi.class);
    }

    private void setupAuthAndFetchMovies() {
        SharedPreferences sharedPreferences = getSharedPreferences("app_prefs", Context.MODE_PRIVATE);
        authToken = sharedPreferences.getString("auth_token", null);

        if (authToken != null) {
            fetchMovies(authToken);
        } else {
            Toast.makeText(this, "User is not authenticated", Toast.LENGTH_SHORT).show();
            navigateToLogin();
        }
    }


    private void fetchMovies(String token) {
        categoryApi.getAllMovies("Bearer " + token).enqueue(new Callback<List<CategoryResponse>>() {
            @Override
            public void onResponse(@NonNull Call<List<CategoryResponse>> call, @NonNull Response<List<CategoryResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<CategoryResponse> categoryResponses = response.body();
                    List<Category> categories = new ArrayList<>();

                    for (CategoryResponse resp : categoryResponses) {
                        Category category = resp.toCategory();
                        categories.add(category);
                    }

                    movieViewModel.insertCategories(categories);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<CategoryResponse>> call, @NonNull Throwable t) {
                Toast.makeText(MovieActivity.this, "Failed to load movies", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateUI(List<Category> categories) {
        selectFeaturedMovie(categories);
        movieAdapter.setCategories(categories);
    }

    private void selectFeaturedMovie(List<Category> categories) {
        List<Movie> allMovies = new ArrayList<>();
        for (Category category : categories) {
            allMovies.addAll(category.getMovies());
        }

        if (!allMovies.isEmpty()) {
            Random random = new Random();
            random.nextInt(allMovies.size());
        }
    }

    private void onMovieClick(Movie movie) {
        Toast.makeText(this, "Selected: " + movie.getName(), Toast.LENGTH_SHORT).show();
    }

    private void navigateToLogin() {
        startActivity(new Intent(MovieActivity.this, LoginActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
        finish();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.toolbar_menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_profile) {
            return true;
        } else if (id == R.id.action_settings) {
            return true;
        } else if (id == R.id.action_admin) {
            Intent intent = new Intent(this, AdminActivity.class);
            startActivity(intent);
            return true;
        } else if (id == R.id.action_logout) {

        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
        return true;
    }
        return super.onOptionsItemSelected(item);
    }
}