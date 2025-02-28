package com.example.androidnetflix.views.activities;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidnetflix.R;
import com.example.androidnetflix.data.api.AdminApi;
import com.example.androidnetflix.data.api.MovieApi;
import com.example.androidnetflix.model.converters.CategoryResponse;
import com.example.androidnetflix.model.converters.SearchResponse;
import com.example.androidnetflix.model.entities.Category;
import com.example.androidnetflix.model.entities.Movie;
import com.example.androidnetflix.viewmodel.MovieViewModel;
import com.example.androidnetflix.views.adapters.CategoryDeletionAdapter;
import com.example.androidnetflix.views.adapters.CategorySelectionAdapter;
import com.example.androidnetflix.views.adapters.MovieSelectionAdapter;
import com.example.androidnetflix.views.adapters.SearchResultsAdapter;
import com.google.gson.Gson;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class AdminActivity extends AppCompatActivity {

    private EditText movieNameInput, movieDurationInput, movieYearInput, movieDescriptionInput;
    private EditText movieDirectorInput, movieCastInput, movieImageInput, movieTrailerInput;
    private EditText categoryNameInput, searchInput;
    private CheckBox categoryPromotedCheckbox;
    private Button createMovieButton, createCategoryButton, searchButton;
    private RecyclerView searchResultsRecyclerView;
    private AdminApi adminApi;
    private List<Category> availableCategories = new ArrayList<>();
    private final List<String> selectedCategoryIds = new ArrayList<>();
    private Button showCategoriesButton;
    private Button showMoviesForCategoryButton;
    private RecyclerView movieSelectionForCategoryRecyclerView;
    private final List<String> selectedMoviesForCategory = new ArrayList<>();
    private Button showCategoriesForDeletionButton;
    private RecyclerView categoriesDeletionRecyclerView;
    private List<Category> availableCategoriesForDeletion = new ArrayList<>();

    private MovieApi movieApi;
    private String authToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin);

        new ViewModelProvider(this).get(MovieViewModel.class);

        setupRetrofit();
        getAuthToken();
        initializeMovieFields();
        initializeCategoryFields();
        initializeSearchFields();
        setupCategorySelection();
        setupMovieSelectionForCategory();
        setupCategoryDeletion();
        setupRecyclerView();
        setupClickListeners();
    }

    private void setupRetrofit() {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(getString(R.string.api_url))
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        adminApi = retrofit.create(AdminApi.class);
        movieApi = retrofit.create(MovieApi.class);
    }

    private void getAuthToken() {
        SharedPreferences sharedPreferences = getSharedPreferences("app_prefs", Context.MODE_PRIVATE);
        authToken = sharedPreferences.getString("auth_token", null);
        if (authToken == null) {
            Toast.makeText(this, "Not authenticated", Toast.LENGTH_SHORT).show();
            finish();
        }
    }

    private void setupRecyclerView() {
        searchResultsRecyclerView = findViewById(R.id.searchResultsRecyclerView);
        searchResultsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
    }

    private void setupClickListeners() {
        createMovieButton.setOnClickListener(v -> createMovie());
        createCategoryButton.setOnClickListener(v -> createCategory());
        searchButton.setOnClickListener(v -> performSearch());
    }

    private void setupCategorySelection() {
        // start button and recyclerView
        showCategoriesButton = findViewById(R.id.showCategoriesButton);
        RecyclerView categoryRecyclerView = findViewById(R.id.categorySelectionRecyclerView);

        showCategoriesButton.setOnClickListener(v -> {
            if (categoryRecyclerView.getVisibility() == View.VISIBLE) {
                categoryRecyclerView.setVisibility(View.GONE);
                showCategoriesButton.setText(R.string.show_categories);
            } else {
                categoryRecyclerView.setVisibility(View.VISIBLE);
                showCategoriesButton.setText(R.string.hide_categories);
                fetchCategories();
            }
        });
    }

    private void fetchCategories() {
        adminApi.getAllCategories("Bearer " + authToken).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<Category>> call, @NonNull Response<List<Category>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    availableCategories = response.body();
                    setupCategoryRecyclerView();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Category>> call, @NonNull Throwable t) {
                Toast.makeText(AdminActivity.this, "Failed to load categories", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupCategoryRecyclerView() {
        RecyclerView categoryRecyclerView = findViewById(R.id.categorySelectionRecyclerView);
        categoryRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        CategorySelectionAdapter adapter = new CategorySelectionAdapter(availableCategories, selectedCategoryIds);
        categoryRecyclerView.setAdapter(adapter);
    }

    private void createMovie() {
        if (validateMovieInput()) {
            return;
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("name", movieNameInput.getText().toString());
            requestBody.put("duration", Integer.parseInt(movieDurationInput.getText().toString()));
            requestBody.put("year", Integer.parseInt(movieYearInput.getText().toString()));
            requestBody.put("description", movieDescriptionInput.getText().toString());
            requestBody.put("director", movieDirectorInput.getText().toString());

            // Convert cast string to JSON array string
            String castString = movieCastInput.getText().toString();
            List<String> castList = Arrays.asList(castString.split(","));
            // Create JSON string from cast list
            String castJson = new Gson().toJson(castList);
            requestBody.put("cast", castJson);

            // Handle categories
            List<Map<String, String>> categories = selectedCategoryIds.stream()
                    .map(id -> {
                        Map<String, String> category = new HashMap<>();
                        category.put("categoryId", id);
                        return category;
                    })
                    .collect(Collectors.toList());
            String categoriesJson = new Gson().toJson(categories);
            requestBody.put("categories", categoriesJson);

            if (!movieImageInput.getText().toString().isEmpty()) {
                requestBody.put("mainImage", movieImageInput.getText().toString());
            }
            if (!movieTrailerInput.getText().toString().isEmpty()) {
                requestBody.put("trailer", movieTrailerInput.getText().toString());
            }

            adminApi.createMovie("Bearer " + authToken, requestBody).enqueue(new Callback<>() {
                @Override
                public void onResponse(@NonNull Call<Movie> call, @NonNull Response<Movie> response) {
                    if (response.isSuccessful()) {
                        Toast.makeText(AdminActivity.this, "Movie created successfully", Toast.LENGTH_SHORT).show();
                        clearMovieFields();
                    } else {
                        try {
                            String errorBody = response.errorBody().string();
                            Toast.makeText(AdminActivity.this, "Failed to create movie: " + errorBody, Toast.LENGTH_SHORT).show();
                        } catch (IOException e) {
                            Toast.makeText(AdminActivity.this, "Failed to create movie", Toast.LENGTH_SHORT).show();
                        }
                    }
                }

                @Override
                public void onFailure(@NonNull Call<Movie> call, @NonNull Throwable t) {
                    Toast.makeText(AdminActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        } catch (Exception e) {
            Toast.makeText(this, "Error creating movie: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void setupMovieSelectionForCategory() {
        showMoviesForCategoryButton = findViewById(R.id.showMoviesForCategoryButton);
        movieSelectionForCategoryRecyclerView = findViewById(R.id.movieSelectionForCategoryRecyclerView);
        movieSelectionForCategoryRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        showMoviesForCategoryButton.setOnClickListener(v -> {
            if (movieSelectionForCategoryRecyclerView.getVisibility() == View.VISIBLE) {
                movieSelectionForCategoryRecyclerView.setVisibility(View.GONE);
                showMoviesForCategoryButton.setText(R.string.show_movies_for_category);
            } else {
                movieSelectionForCategoryRecyclerView.setVisibility(View.VISIBLE);
                showMoviesForCategoryButton.setText(R.string.hide_movies);
                AdminActivity.this.setupMovieSelection();
            }
        });
    }

    private void setupMovieSelection() {
        movieApi.getAllMovies("Bearer " + authToken).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<CategoryResponse>> call, @NonNull Response<List<CategoryResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Flatten all movies from all categories into a single list
                    List<Movie> allMovies = new ArrayList<>();
                    for (CategoryResponse category : response.body()) {
                        if (category.getMovies() != null) {
                            allMovies.addAll(category.getMovies());
                        }
                    }

                    // Remove duplicates based on movie ID
                    List<Movie> uniqueMovies = new ArrayList<>(new LinkedHashSet<>(allMovies));

                    // Update the RecyclerView
                    MovieSelectionAdapter adapter = new MovieSelectionAdapter(uniqueMovies, selectedMoviesForCategory);
                    movieSelectionForCategoryRecyclerView.setAdapter(adapter);
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<CategoryResponse>> call, @NonNull Throwable t) {
                Toast.makeText(AdminActivity.this, "Failed to load movies", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void createCategory() {
        String name = categoryNameInput.getText().toString();
        if (name.isEmpty()) {
            Toast.makeText(this, "Category name is required", Toast.LENGTH_SHORT).show();
            return;
        }

        Map<String, Object> categoryData = new HashMap<>();
        categoryData.put("name", name);
        categoryData.put("promoted", categoryPromotedCheckbox.isChecked());

        ArrayList<Object> moviesArray = new ArrayList<>();
        for (String movieId : selectedMoviesForCategory) {
            Map<String, String> movieObject = new HashMap<>();
            movieObject.put("movieId", movieId);
            moviesArray.add(movieObject);
        }
        categoryData.put("movies", moviesArray);

        adminApi.createCategory("Bearer " + authToken, categoryData).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<ResponseBody> call, @NonNull Response<ResponseBody> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AdminActivity.this, "Category created successfully", Toast.LENGTH_SHORT).show();
                    clearCategoryFields();
                    selectedMoviesForCategory.clear();
                } else {
                    Toast.makeText(AdminActivity.this, "Failed to create category", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ResponseBody> call, @NonNull Throwable t) {
            }
        });
    }

    private void performSearch() {
        String searchTerm = searchInput.getText().toString();
        if (searchTerm.isEmpty()) {
            Toast.makeText(this, "Please enter a query", Toast.LENGTH_SHORT).show();
            return;
        }

        movieApi.searchMovies(searchTerm).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<SearchResponse> call, @NonNull Response<SearchResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    displaySearchResults(response.body().getMovies());
                } else {
                    Toast.makeText(AdminActivity.this, "Search failed", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<SearchResponse> call, @NonNull Throwable t) {
                Toast.makeText(AdminActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void displaySearchResults(List<Movie> movies) {
        SearchResultsAdapter adapter = new SearchResultsAdapter(movies,
                movie -> deleteMovie(movie.getId()),
                this::showUpdateDialog
        );
        searchResultsRecyclerView.setAdapter(adapter);
    }

    private void deleteMovie(String movieId) {
        adminApi.deleteMovie("Bearer " + authToken, movieId).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AdminActivity.this, "Movie deleted successfully", Toast.LENGTH_SHORT).show();
                    performSearch();
                } else {
                    Toast.makeText(AdminActivity.this, "Failed to delete movie", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Toast.makeText(AdminActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showUpdateDialog(Movie movie) {
        // Fill the movie fields with existing data
        movieNameInput.setText(movie.getName());
        movieDurationInput.setText(String.valueOf(movie.getDuration()));
        movieYearInput.setText(String.valueOf(movie.getYear()));
        movieDescriptionInput.setText(movie.getDescription());
        movieDirectorInput.setText(movie.getDirector());
        movieCastInput.setText(String.join(",", movie.getCast()));
        movieImageInput.setText(movie.getMainImage());
        //movieTrailerInput.setText(movie.getTrailer());

        // Change create button to update
        createMovieButton.setText("Update Movie");
        createMovieButton.setOnClickListener(v -> updateMovie(movie.getId()));
    }

    private void updateMovie(String movieId) {
        if (validateMovieInput()) {
            return;
        }

        Movie movie = new Movie();
        movie.setName(movieNameInput.getText().toString());
        movie.setDuration(Integer.parseInt(movieDurationInput.getText().toString()));
        movie.setYear(Integer.parseInt(movieYearInput.getText().toString()));
        movie.setDescription(movieDescriptionInput.getText().toString());
        movie.setDirector(movieDirectorInput.getText().toString());
        movie.setCast(Arrays.asList(movieCastInput.getText().toString().split(",")));
        movie.setMainImage(movieImageInput.getText().toString());
        //movie.setTrailer(movieTrailerInput.getText().toString());

        List<Map<String, String>> categories = selectedCategoryIds.stream()
                .map(id -> {
                    Map<String, String> category = new HashMap<>();
                    category.put("categoryId", id);
                    return category;
                })
                .collect(Collectors.toList());

        // Create request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", movie.getName());
        requestBody.put("duration", movie.getDuration());
        requestBody.put("year", movie.getYear());
        requestBody.put("description", movie.getDescription());
        requestBody.put("director", movie.getDirector());
        requestBody.put("cast", movie.getCast());
        requestBody.put("mainImage", movie.getMainImage());
        //requestBody.put("trailer", movie.getTrailer());
        requestBody.put("categories", categories);

        adminApi.updateMovie("Bearer " + authToken, movieId, requestBody).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Movie> call, @NonNull Response<Movie> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AdminActivity.this, "Movie updated successfully", Toast.LENGTH_SHORT).show();
                    clearMovieFields();
                    resetCreateButton();
                } else {
                    Toast.makeText(AdminActivity.this, "Failed to update movie", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Movie> call, @NonNull Throwable t) {
                Toast.makeText(AdminActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void resetCreateButton() {
        createMovieButton.setText("Create Movie");
        createMovieButton.setOnClickListener(v -> createMovie());
    }

    private boolean validateMovieInput() {
        if (movieNameInput.getText().toString().isEmpty()
                || movieDurationInput.getText().toString().isEmpty()
                || movieYearInput.getText().toString().isEmpty()) {
            Toast.makeText(this, "Name, duration and year are required", Toast.LENGTH_SHORT).show();
            return true;
        }
        return false;
    }

    private void clearMovieFields() {
        movieNameInput.setText("");
        movieDurationInput.setText("");
        movieYearInput.setText("");
        movieDescriptionInput.setText("");
        movieDirectorInput.setText("");
        movieCastInput.setText("");
        movieImageInput.setText("");
        movieTrailerInput.setText("");
    }

    private void clearCategoryFields() {
        categoryNameInput.setText("");
        categoryPromotedCheckbox.setChecked(false);
    }

    private void initializeMovieFields() {
        movieNameInput = findViewById(R.id.movieNameInput);
        movieDurationInput = findViewById(R.id.movieDurationInput);
        movieYearInput = findViewById(R.id.movieYearInput);
        movieDescriptionInput = findViewById(R.id.movieDescriptionInput);
        movieDirectorInput = findViewById(R.id.movieDirectorInput);
        movieCastInput = findViewById(R.id.movieCastInput);
        movieImageInput = findViewById(R.id.movieImageInput);
        movieTrailerInput = findViewById(R.id.movieTrailerInput);
        createMovieButton = findViewById(R.id.createMovieButton);
    }

    private void initializeCategoryFields() {
        categoryNameInput = findViewById(R.id.categoryNameInput);
        categoryPromotedCheckbox = findViewById(R.id.categoryPromotedCheckbox);
        createCategoryButton = findViewById(R.id.createCategoryButton);
    }

    private void initializeSearchFields() {
        searchInput = findViewById(R.id.searchInput);
        searchButton = findViewById(R.id.searchButton);
        searchResultsRecyclerView = findViewById(R.id.searchResultsRecyclerView);
    }

    private void setupCategoryDeletion() {
        showCategoriesForDeletionButton = findViewById(R.id.showCategoriesForDeletionButton);
        categoriesDeletionRecyclerView = findViewById(R.id.categoriesDeletionRecyclerView);
        categoriesDeletionRecyclerView.setLayoutManager(new LinearLayoutManager(this));

        showCategoriesForDeletionButton.setOnClickListener(v -> {
            if (categoriesDeletionRecyclerView.getVisibility() == View.VISIBLE) {
                categoriesDeletionRecyclerView.setVisibility(View.GONE);
                showCategoriesForDeletionButton.setText(R.string.show_categories_for_deletion);
            } else {
                categoriesDeletionRecyclerView.setVisibility(View.VISIBLE);
                showCategoriesForDeletionButton.setText(R.string.hide_categories);
                fetchCategoriesForDeletion();
            }
        });
    }

    private void fetchCategoriesForDeletion() {
        adminApi.getAllCategories("Bearer " + authToken).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<List<Category>> call, @NonNull Response<List<Category>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    availableCategoriesForDeletion = response.body();
                    setupCategoryDeletionRecyclerView();
                }
            }

            @Override
            public void onFailure(@NonNull Call<List<Category>> call, @NonNull Throwable t) {
                Toast.makeText(AdminActivity.this, "Failed to load categories", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupCategoryDeletionRecyclerView() {
        CategoryDeletionAdapter adapter = new CategoryDeletionAdapter(
                availableCategoriesForDeletion,
                category -> deleteCategory(category.getCategoryId())
        );
        categoriesDeletionRecyclerView.setAdapter(adapter);
    }

    private void deleteCategory(String categoryId) {
        adminApi.deleteCategory("Bearer " + authToken, categoryId).enqueue(new Callback<>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(AdminActivity.this, "Category deleted successfully", Toast.LENGTH_SHORT).show();
                    fetchCategoriesForDeletion();
                } else {
                    Toast.makeText(AdminActivity.this, "Failed to delete category", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Toast.makeText(AdminActivity.this, "Network error", Toast.LENGTH_SHORT).show();
            }
        });
    }
}