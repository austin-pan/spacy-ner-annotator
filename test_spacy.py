import spacy

def test_spacy(text):
	print("custom:")
	doc = custom_nlp(text)
	for ent in doc.ents:
		print(ent.text, ent.start_char, ent.end_char, ent.label_)

	print("")
	print("blank:")
	doc = blank_nlp(text)
	for ent in doc.ents:
		print(ent.text, ent.start_char, ent.end_char, ent.label_)

model_path = "sfc_test"
custom_nlp = spacy.load(model_path)

blank_nlp = spacy.load("en_core_web_sm")

file_path = "data/sfc_docs_1_25.txt"
data = []
with open(file_path, 'r') as f:
	data = f.readlines()

for d in data:
	test_spacy(d)
	print("\n---\n")