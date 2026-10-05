FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and assets
COPY . /app/

EXPOSE 8090

ENV PORT=8090
ENV HOST=0.0.0.0

CMD ["python", "server/main.py"]
