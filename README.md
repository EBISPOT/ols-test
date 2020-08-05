# ols-test

This is a simple app to compare JSON responses between 2 different servers. 

Run it as follows:

docker run -v $(pwd)/out:/<$YOUR_LOCAL_DIR> jmcl/ols-test:1.5.0 --instance1 "<URL of Instance1>" --instance2 "<URL of Instance1>" 
\\--size <number of terms to retrieve> --sample-size <sample to retrieve from result> --out-dir <$YOUR_LOCAL_DIR> <ontology_to_query>

Example:

docker run -v $(pwd)/out:/home/henriette/out jmcl/ols-test:1.5.0 --instance1 "https://wwwdev.ebi.ac.uk/ols" --instance2 "http://www.ebi.ac.uk/ols" 
--size 500 --sample-size 1 --out-dir /home/henriette/out mondo




