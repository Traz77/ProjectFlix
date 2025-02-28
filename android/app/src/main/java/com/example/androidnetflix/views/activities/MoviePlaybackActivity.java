package com.example.androidnetflix.views.activities;

import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.androidnetflix.R;
import com.example.androidnetflix.model.entities.Movie;

public class MoviePlaybackActivity extends AppCompatActivity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_movie_playback);

        webView = findViewById(R.id.movieWebView);
        Button closeButton = findViewById(R.id.closePlaybackButton);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient());

        Movie movie = (Movie) getIntent().getSerializableExtra("movie");
        if (movie != null && movie.getMovieFile() != null) {
            String baseUrl = getString(R.string.api_url).replace("/api/", "");
            String videoUrl = baseUrl + movie.getMovieFile();
            webView.loadUrl(videoUrl);
        } else {
            Toast.makeText(this, "Error loading video", Toast.LENGTH_SHORT).show();
            finish();
        }

        closeButton.setOnClickListener(v -> finish());
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}