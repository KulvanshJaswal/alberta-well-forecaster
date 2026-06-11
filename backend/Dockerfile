# Start with an official Python 3.11 image
FROM python:3.11-slim

# Set the working directory inside the container
# All commands after this run from /app
WORKDIR /app

# Copy requirements first (before code) so Docker can cache this layer
# If your code changes but requirements don't, Docker skips reinstalling packages
COPY requirements.txt .

# Install your Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code into the container
COPY . .

# Tell Docker this container listens on port 8000
EXPOSE 8000

# The command that runs when the container starts
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]