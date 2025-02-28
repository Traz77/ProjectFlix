package com.example.androidnetflix.views.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.androidnetflix.R;
import com.example.androidnetflix.model.entities.Category;
import com.example.androidnetflix.model.entities.Movie;
import com.example.androidnetflix.views.activities.MovieDetailsActivity;

import java.util.ArrayList;
import java.util.List;

public class MovieAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
    private List<Movie> movies;
    private List<Category> categories;
    private static final int VIEW_TYPE_CATEGORY = 0;
    private static final int VIEW_TYPE_MOVIE = 1;

    private boolean isSearchMode = false;
    private final OnMovieClickListener listener;
    private final Context context;
    private boolean isCategory;

    public boolean isSearchMode() {
        return isSearchMode;
    }

    public void setSearchMode(boolean searchMode) {
        isSearchMode = searchMode;
    }

    public interface OnMovieClickListener {
        void onMovieClick(Movie movie);
    }

    public MovieAdapter(Context context, OnMovieClickListener listener) {
        this.context = context;
        this.listener = listener;
        this.categories = new ArrayList<>();
        this.movies = new ArrayList<>();
        this.isCategory = true;
    }


    public MovieAdapter(Context context, List<Movie> movies, OnMovieClickListener listener) {
        this.context = context;
        this.movies = new ArrayList<>();
        this.movies.addAll(movies);
        this.listener = listener;
        this.isCategory = false;
    }


    @Override
    public int getItemViewType(int position) {
        return isCategory ? VIEW_TYPE_CATEGORY : VIEW_TYPE_MOVIE;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(parent.getContext());
        if (viewType == VIEW_TYPE_CATEGORY) {
            View view = inflater.inflate(R.layout.item_movie_list, parent, false);
            return new CategoryViewHolder(view);
        } else {
            View view = inflater.inflate(R.layout.item_movie, parent, false);
            return new MovieViewHolder(view);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        if (holder.getItemViewType() == VIEW_TYPE_CATEGORY) {
            CategoryViewHolder categoryHolder = (CategoryViewHolder) holder;
            Category category = categories.get(position);
            categoryHolder.bind(category);
        } else {
            MovieViewHolder movieHolder = (MovieViewHolder) holder;
            Movie movie = movies.get(position);
            movieHolder.bind(movie);
        }
    }

    public void clearData() {
        this.movies = new ArrayList<>();
        this.categories = new ArrayList<>();
        this.isCategory = false;
        notifyItemRangeRemoved(0, getItemCount());
        notifyDataSetChanged();
    }

    public void updateMovies(List<Movie> newMovies) {
        int oldSize = getItemCount();

        this.movies = new ArrayList<>(newMovies);
        this.categories = new ArrayList<>();
        this.isCategory = false;
        notifyItemRangeRemoved(0, oldSize);
        notifyDataSetChanged();
    }

    @Override
    public int getItemCount() {
        if (isCategory) {
            return categories != null ? categories.size() : 0;
        }
        return movies != null ? movies.size() : 0;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
        notifyDataSetChanged();
    }

    class CategoryViewHolder extends RecyclerView.ViewHolder {
        TextView titleTextView;
        RecyclerView moviesRecyclerView;

        CategoryViewHolder(@NonNull View itemView) {
            super(itemView);
            titleTextView = itemView.findViewById(R.id.category_title);
            moviesRecyclerView = itemView.findViewById(R.id.movies_recycler_view);
        }

        void bind(Category category) {
            // Set the category title
            titleTextView.setText(category.getName());

            // Ensure the LayoutManager is set only once
            if (moviesRecyclerView.getLayoutManager() == null) {
                moviesRecyclerView.setLayoutManager(new LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false));
            }

            // Set the movie adapter for this category's movies
            MovieAdapter movieAdapter = new MovieAdapter(context, category.getMovies(), listener);
            moviesRecyclerView.setAdapter(movieAdapter);
        }
    }

    class MovieViewHolder extends RecyclerView.ViewHolder {
        TextView nameTextView;
        TextView yearTextView;
        ImageView mainImageView;

        MovieViewHolder(@NonNull View itemView) {
            super(itemView);
            nameTextView = itemView.findViewById(R.id.movie_name);
            yearTextView = itemView.findViewById(R.id.movie_year);
            mainImageView = itemView.findViewById(R.id.movie_image);
        }

        void bind(Movie movie) {
            if (movie != null) {
                nameTextView.setText(movie.getName());
                yearTextView.setText(String.valueOf(movie.getYear()));

                if (movie.getMainImage() != null) {
                    Glide.with(itemView)
                            .load(movie.getMainImage())
                            .placeholder(R.drawable.ic_movie_placeholder)
                            .error(R.drawable.ic_movie_placeholder)
                            .into(mainImageView);
                }

                itemView.setOnClickListener(v -> {
                    Intent intent = new Intent(context, MovieDetailsActivity.class);
                    intent.putExtra("movie", movie);
                    context.startActivity(intent);
                });
            }
        }
    }
}