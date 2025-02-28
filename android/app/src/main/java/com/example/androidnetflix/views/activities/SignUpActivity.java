package com.example.androidnetflix.views.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.androidnetflix.R;
import com.example.androidnetflix.repositories.SignUpRepository;
import com.example.androidnetflix.repositories.SignUpRepository.SignUpCallback;

public class SignUpActivity extends AppCompatActivity {

    private EditText editTextFirstName, editTextTextEmailAddress, editTextTextPassword, editTextLastName;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_up);

        new SignUpRepository(this);

        editTextFirstName = findViewById(R.id.editTextFirstName);
        editTextLastName = findViewById(R.id.editTextLastName);
        editTextTextEmailAddress = findViewById(R.id.editTextTextEmailAddress);
        editTextTextPassword = findViewById(R.id.editTextTextPassword);
        Button btnSignUp = findViewById(R.id.btnSignUp);
        Button btnHaveAccount = findViewById(R.id.btnHaveAccount);

        btnSignUp.setOnClickListener(v -> handleSignUp());
        btnHaveAccount.setOnClickListener(v -> {
            Intent i = new Intent(SignUpActivity.this, LoginActivity.class);
            startActivity(i);
        });
    }

    private void handleSignUp() {
        String firstName = editTextFirstName.getText().toString().trim();
        String lastName = editTextLastName.getText().toString().trim();
        String email = editTextTextEmailAddress.getText().toString().trim();
        String password = editTextTextPassword.getText().toString();

        if (!validateInput(firstName, lastName, email, password)) {
            return;
        }

        SignUpRepository.signUp(email, password, firstName, lastName, new SignUpCallback() {
            @Override
            public void onSignUpSuccess() {
                Intent i = new Intent(SignUpActivity.this, LoginActivity.class);
                startActivity(i);
            }

            @Override
            public void onSignUpFailure(String errorMessage) {
                Toast.makeText(SignUpActivity.this, errorMessage, Toast.LENGTH_SHORT).show();
            }
        });
    }

    private boolean validateInput(String firstName, String lastName, String email, String password) {
        if (firstName.isEmpty()) {
            editTextFirstName.setError("First name is required");
            return false;
        }

        if (lastName.isEmpty()) {
            editTextLastName.setError("Last name is required");
            return false;
        }

        if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            editTextTextEmailAddress.setError("Valid email is required");
            return false;
        }

        if (password.isEmpty() || password.length() < 6) {
            editTextTextPassword.setError("Password must be at least 6 characters");
            return false;
        }

        return true;
    }
}