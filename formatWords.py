from xml.etree.ElementTree import tostring


new = []
with open(' INPUT FILE ') as f:
    for line in f:
        new.append(line.rstrip('\n'))
print(new)
with open("outputfile.txt", "w") as external_file:
    print(new,file=external_file)
    external_file.close()
