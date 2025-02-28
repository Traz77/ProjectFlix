package com.example.androidnetflix.views.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidnetflix.R;
import com.example.androidnetflix.model.entities.Category;

import java.util.List;

public class CategoryDeletionAdapter extends RecyclerView.Adapter<CategoryDeletionAdapter.ViewHolder> {
    private final List<Category> categories;
    private final OnCategoryDeleteListener deleteListener;

    public interface OnCategoryDeleteListener {
        void onCategoryDelete(Category category);
    }

    public CategoryDeletionAdapter(List<Category> categories, OnCategoryDeleteListener listener) {
        this.categories = categories;
        this.deleteListener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_category_deletion, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Category category = categories.get(position);
        holder.categoryName.setText(category.getName());
        holder.deleteButton.setOnClickListener(v -> {
            if (deleteListener != null) {
                deleteListener.onCategoryDelete(category);
            }
        });
    }

    @Override
    public int getItemCount() {
        return categories.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView categoryName;
        Button deleteButton;

        ViewHolder(View view) {
            super(view);
            categoryName = view.findViewById(R.id.categoryNameText);
            deleteButton = view.findViewById(R.id.categoryDeleteButton);
        }
    }
}