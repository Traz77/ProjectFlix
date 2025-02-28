package com.example.androidnetflix.views.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.lifecycle.ViewModelProvider;

import com.example.androidnetflix.R;
import com.example.androidnetflix.databinding.ActivityLogInPageBinding;
import com.example.androidnetflix.viewmodel.LoginViewModel;

public class LoginActivity extends AppCompatActivity {
    private ActivityLogInPageBinding binding;
    private LoginViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);

        setContentView(R.layout.activity_log_in_page);

        binding = ActivityLogInPageBinding.inflate(getLayoutInflater());

        setContentView(binding.getRoot());

        viewModel = new ViewModelProvider(this).get(LoginViewModel.class);
        setupObservers();
        setupClickListeners();


        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    private void setupObservers() {
        viewModel.getIsLoggedIn().observe(this, isLoggedIn -> {
            if (isLoggedIn) {
                startActivity(new Intent(LoginActivity.this, MovieActivity.class));
                finish();
                Toast.makeText(LoginActivity.this, "Login successful!", Toast.LENGTH_SHORT).show();

            }
        });

        viewModel.getError().observe(this, error -> {
            if (error != null) {
                Toast.makeText(this, error, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupClickListeners() {
        // Handle the sign-in button
        binding.signInButton.setOnClickListener(v -> {
            String email = binding.editTextTextEmailAddress.getText().toString();
            String password = binding.editTextTextPassword.getText().toString();

            if (!email.isEmpty() && !password.isEmpty()) {
                viewModel.login(email, password);
            } else {
                Toast.makeText(LoginActivity.this, "Email & Password required", Toast.LENGTH_SHORT).show();

            }
        });
        binding.btnSignUp.setOnClickListener(v -> {
            Intent i = new Intent(this, SignUpActivity.class);
            startActivity(i);
        });
    }
}