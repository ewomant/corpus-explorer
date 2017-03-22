# WdK-Explorer Interface 

The interface is based on Apache Solr's default UI Solritas / [VelocityResponsewriter] and uses an extended set of [Velocity](https://velocity.apache.org/)-Templating files as well as additional JS/JQuery/D3-Scipts. We augment Solr-Results with additional links, statistics and vizualisations  based on the current solr-query as well as from additional queries issued from the client (asynchronous JSON in Javascript).


##Solr
WdK-Explorer Interface has been tested with Version Solr Version 6.1- 6.4
Solr should be started with at least 3 GB of Java Heap-Memory to support complex Statistics-Queries
e.g. bin\solr  start -m 4g

Warning: VelocityResponsewriter is not meant to be used in production. To expose the UI publicly, some saftey measures have to be taken.

Public access needed to the following paths.  Access to other paths should be prevented to prevent commits/updates/deletes of documents in the index.
  
solr/[core-name]/browse 
solr/[core-name]/json
solr/admin/file

Some notes on using VelocityResponsewriter in Production environments
  
  
  - in order to restrict access to the Solr admin interface, change
  authentication configuration in the solr war's web.xml.ve
  - consider using Apache httpd as a reverse proxy to restrict direct
  access to your solritas.
  https://mail-archives.apache.org/mod_mbox/lucene-solr-user/201205.mbox/%3CCAJQKefH7bv11U_tSgg481hCjHovjo+GUuNyoETSZEhXR4Ve9+w@mail.gmail.com%3E
  
 
  
  https://thoughtsasaservice.wordpress.com/2012/05/10/should-you-use-solritas-on-production/
  https://lucidworks.com/blog/2015/12/08/browse-new-improved-solr-5/


## Configuration of VelocityResponsewriter solrconfig.xml

 

###Definition of Facets in solrconfig.xml

###Additional Libraries
The additional libraries loaded by
wdk.07.01/lib

## Configuration of VelocityResponsewriter in velocity/config.vm

fieldnames
timefield

## Documentation of Corpus-Generation and creation in footer

##schema.xml 
For indexing
Copyfield: enable 
