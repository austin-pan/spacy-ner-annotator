import json
from os import listdir
from os.path import isfile, join

mypath = "data_annotations"
files = [join(mypath, f) for f in listdir(mypath) if isfile(join(mypath, f)) and f.endswith(".json")]

TRAIN_DATA = []
for filename in files:
	print(filename)

	with open(filename) as train_data:
		train = json.load(train_data)

	for data in train:
		ents = [tuple(entity) for entity in data['entities']]

		TRAIN_DATA.append((data['content'],{'entities':ents}))

filename = 'train.json'
with open(filename, 'w') as fjson:
    json.dump(TRAIN_DATA, fjson)

# print(TRAIN_DATA)
print("Dumped to ", filename)