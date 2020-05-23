<img src='https://img.shields.io/badge/igv-local&ndash;only-red.svg'></pre>

# igv.js

## Deployment on macOS

### Get igv source

```
cd ~/Sites
https://github.com/slw287r/igv.git
```

### Prepare refGene and reference (GRCh37/hg19)

```
% tree ~/Sites/igv/resources/data 
~/Sites/igv/resources/data 
├── cytoBand.txt
├── hg19.fasta
├── hg19.fasta.fai
├── refGene.sorted.txt.gz
╰── refGene.sorted.txt.gz.tbi
```

<table>
  <tr align="left">
    <th>File</th>
    <th>URL</th>
  </tr>
  <tr>
    <td>fasta</td>
    <td>https://s3.dualstack.us-east-1.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/hg19.fasta</td>
  </tr>
  <tr>
    <td>index</td>
    <td>https://s3.dualstack.us-east-1.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/hg19.fasta.fai</td>
  </tr>
  <tr>
    <td>cytoband</td>
    <td>https://s3.dualstack.us-east-1.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg19/cytoBand.txt</td>
  </tr>
  <tr>
    <td>refGene</td>
    <td>https://s3.dualstack.us-east-1.amazonaws.com/igv.org.genomes/hg19/refGene.sorted.txt.gz</td>
  </tr>
  <tr>
    <td>index</td>
    <td>https://s3.dualstack.us-east-1.amazonaws.com/igv.org.genomes/hg19/refGene.sorted.txt.gz.tbi</td>
  </tr>
</table>

### Build local server on macOS

Refer to the following link to turn on apache server

https://websitebeaver.com/set-up-localhost-on-macos-high-sierra-apache-mysql-and-php-7-with-sslhttps


### Start apache server

```
sudo apachectl start
```

### Start your IGV journey

http://localhost/igv/index.html

## Reference

https://github.com/igvteam/igv-webapp
