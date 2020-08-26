import json

filename = "sfc_docs_1_25_austin.json"
with open(filename) as train_data:
	train = json.load(train_data)

train = train[0:5]

TRAIN_DATA = []
for data in train:
	text = data['content']
	ents = data['entities']

	offset = 0
	prev = dict()
	print(text)
	for ent in ents:
		start = int(ent[0])
		end = int(ent[1])
		annotation = text[start:end]
		# print(annotation)
		# print(start," ", end)

		key = None
		for k in prev.keys():
			if annotation in k:
				key = k
				break
		# print(key)
		if key is not None:
			length = end - start
			# print(prev[key])
			start = text.index(annotation, prev.get(key) + 1)
			end = start + length
			prev[key] = ent[1]

			ent[0] = start
			ent[1] = end
			# print(start," ", end)
		else:
			prev[annotation] = end

	ents = [tuple(entity) for entity in data['entities']]

	print(ents)