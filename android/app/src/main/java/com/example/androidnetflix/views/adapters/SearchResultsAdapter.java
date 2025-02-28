package com.example.androidnetflix.views.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidnetflix.R;
import com.example.androidnetflix.model.entities.Movie;

import java.util.List;

public class SearchResultsAdapter extends RecyclerView.Adapter<SearchResultsAdapter.ViewHolder> {
    private final List<Movie> movies;
    private final OnDeleteClickListener deleteListener;
    private final OnUpdateClickListener updateListener;

    public interface OnDeleteClickListener {
        void onDeleteClick(Movie movie);
    }

    public interface OnUpdateClickListener {
        void onUpdateClick(Movie movie);
    }

    public SearchResultsAdapter(List<Movie> movies, OnDeleteClickListener deleteListener,
                                OnUpdateClickListener updateListener) {
        this.movies = movies;
        this.deleteListener = deleteListener;
        this.updateListener = updateListener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.search_result_item, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        Movie movie = movies.get(position);
        holder.movieName.setText(movie.getName());
        holder.movieYear.setText(String.valueOf(movie.getYear()));

        holder.deleteButton.setOnClickListener(v -> deleteListener.onDeleteClick(movie));
        holder.updateButton.setOnClickListener(v -> updateListener.onUpdateClick(movie));
    }

    @Override
    public int getItemCount() {
        return movies.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView movieName;
        TextView movieYear;
        Button deleteButton;
        Button updateButton;

        ViewHolder(View view) {
            super(view);
            movieName = view.findViewById(R.id.movieName);
            movieYear = view.findViewById(R.id.movieYear);
            deleteButton = view.findViewById(R.id.deleteButton);
            updateButton = view.findViewById(R.id.updateButton);
        }
    }
}