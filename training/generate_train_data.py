import json
from os import listdir
from os.path import isfile, join

# load all json data files in the 'data_path' directory.
def load_data(data_path):
    # Get all json file names in 'data_path'
    files = [join(data_path, f) for f in listdir(data_path) if isfile(join(data_path, f)) and f.endswith(".json")]

    data = []
    for filename in files:
        print(filename)
        with open(filename) as file:
            train = json.load(file)

        for d in train:
            data.append((d['content'],{'entities':d['entities']}))
    return data


# Compile all training data into one json file, not needed for training.
if __name__ == "__main__":
    train_data = load_data("data_annotations")

    filename = 'train.json'
    with open(filename, 'w') as fjson:
        json.dump(train_data, fjson)

    # print(TRAIN_DATA)
    print("Dumped to", filename)
    