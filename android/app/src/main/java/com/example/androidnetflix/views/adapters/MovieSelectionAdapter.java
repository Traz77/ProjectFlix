package com.example.androidnetflix.views.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidnetflix.R;
import com.example.androidnetflix.model.entities.Movie;

import java.util.List;

public class MovieSelectionAdapter extends RecyclerView.Adapter<MovieSelectionAdapter.ViewHolder> {
    private final List<Movie> movies;
    private final List<String> selectedMovieIds;

    public MovieSelectionAdapter(List<Movie> movies, List<String> selectedMovieIds) {
        this.movies = movies;
        this.selectedMovieIds = selectedMovieIds;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_movie_selection, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Movie movie = movies.get(position);
        holder.checkBox.setText(movie.getName());
        // Use _id instead of getId() since that's what's in the JSON
        holder.checkBox.setChecked(selectedMovieIds.contains(movie.getId()));
        holder.checkBox.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                selectedMovieIds.add(movie.getId());
            } else {
                selectedMovieIds.remove(movie.getId());
            }
        });
    }

    @Override
    public int getItemCount() {
        return movies.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        CheckBox checkBox;

        ViewHolder(View view) {
            super(view);
            checkBox = view.findViewById(R.id.movieCheckBox);
        }
    }
}