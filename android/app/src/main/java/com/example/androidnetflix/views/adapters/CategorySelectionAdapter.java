package com.example.androidnetflix.views.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.androidnetflix.R;
import com.example.androidnetflix.model.entities.Category;

import java.util.List;

public class CategorySelectionAdapter extends RecyclerView.Adapter<CategorySelectionAdapter.ViewHolder> {
    private final List<Category> categories;
    private final List<String> selectedCategoryIds;

    public CategorySelectionAdapter(List<Category> categories, List<String> selectedCategoryIds) {
        this.categories = categories;
        this.selectedCategoryIds = selectedCategoryIds;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_category_selection, parent, false);
        return new ViewHolder((CheckBox) view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Category category = categories.get(position);
        // Use getCategoryName() directly from the API response
        holder.checkBox.setText(category.getCategoryName());
        holder.checkBox.setChecked(selectedCategoryIds.contains(category.getCategoryId()));

        holder.checkBox.setOnCheckedChangeListener((buttonView, isChecked) -> {
            String categoryId = category.getCategoryId();
            if (isChecked) {
                if (!selectedCategoryIds.contains(categoryId)) {
                    selectedCategoryIds.add(categoryId);
                }
            } else {
                selectedCategoryIds.remove(categoryId);
            }
        });
    }

    @Override
    public int getItemCount() {
        return categories.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        CheckBox checkBox;

        ViewHolder(CheckBox checkBox) {
            super(checkBox);
            this.checkBox = checkBox;
        }
    }
}