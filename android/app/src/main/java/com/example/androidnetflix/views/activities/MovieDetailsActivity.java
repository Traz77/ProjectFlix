    package com.example.androidnetflix.views.activities;

    import android.content.Intent;
    import android.os.Bundle;
    import android.widget.Button;
    import android.widget.ImageView;
    import android.widget.TextView;
    import android.widget.Toast;

    import androidx.appcompat.app.AppCompatActivity;

    import com.bumptech.glide.Glide;
    import com.example.androidnetflix.R;
    import com.example.androidnetflix.model.entities.Movie;

    public class MovieDetailsActivity extends AppCompatActivity {

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.activity_movie_details);

            Button closeButton = findViewById(R.id.closeButton);
            closeButton.setOnClickListener(v -> finish());
            Button playButton = findViewById(R.id.playMovieButton);

            ImageView movieImage = findViewById(R.id.movieDetailImage);
            TextView titleText = findViewById(R.id.movieDetailTitle);
            TextView yearText = findViewById(R.id.movieDetailYear);
            TextView durationText = findViewById(R.id.movieDetailDuration);
            TextView descriptionText = findViewById(R.id.movieDetailDescription);
            TextView directorText = findViewById(R.id.movieDetailDirector);
            TextView castText = findViewById(R.id.movieDetailCast);


            Intent intent = getIntent();
            if (intent != null) {
                Movie movie = (Movie) intent.getSerializableExtra("movie");
                if (movie != null) {
                    titleText.setText(movie.getName());
                    yearText.setText(String.valueOf(movie.getYear()));
                    durationText.setText(movie.getDuration() + " min");
                    descriptionText.setText(movie.getDescription());
                    directorText.setText(movie.getDirector());
                    castText.setText(String.join(", ", movie.getCast()));

                    if (movie.getMainImage() != null) {
                        Glide.with(this)
                                .load(movie.getMainImage())
                                .placeholder(R.drawable.ic_movie_placeholder)
                                .error(R.drawable.ic_movie_placeholder)
                                .into(movieImage);
                    }
                }
                playButton.setOnClickListener(v -> {
                    if (movie.getMovieFile() != null && !movie.getMovieFile().isEmpty()) {
                        Intent playIntent = new Intent(MovieDetailsActivity.this, MoviePlaybackActivity.class);
                        playIntent.putExtra("movie", movie);
                        startActivity(playIntent);
                    } else {
                        Toast.makeText(this, "No video available", Toast.LENGTH_SHORT).show();
                    }
                });
            }


        }
    }