# Participation Scorer

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

In another terminal, you can run:

### `npm run start-api`

Runs the backend Python Flask server.

If you would like to tune the parameters for better participation scoring, tune the following parameters in `api.py`:

```
EXCLUDED_WORDS # list of words to exclude in contributions
MIN_WORDS # minimum words needed to even be considered a valid contribution
INCLUDE_LENGTH = # minimum words needed to include a contribution that had an excluded word
```

Make sure to create an Ed Discussion API token and include the course ID in `api.py` to run the project for yourself!
