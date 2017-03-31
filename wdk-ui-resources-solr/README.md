# WdK-Explorer Interface 

The interface is based on Apache Solr's default UI *[VelocityResponsewriter](https://cwiki.apache.org/confluence/display/solr/Velocity+Response+Writer)* (also known as Solritas and uses an extended set of *[Velocity](https://velocity.apache.org/)-Templates* together with *client-side JS/JQuery/D3-Scipts*. We augment results with comparative statistics, vizualisations and links to the original collection. 

Below, the prerequisites of a WdK-Explorer Installation are explained with suggestions regarding where future changes to the index-structure need to be accomodated. 


Solr
------
WdK-Explorer Interface has been tested with Version *Solr Version 6.1, 6.2. and 6.4.2.* Solr should be started with at least `3 GB` of Java Heap-Memory to support complex Statistics-Queries, e.g. `bin\solr  start -m 4g`

Warning: *VelocityResponsewriter* is not meant to be used in production. To expose the UI publicly, some saftey measures have to be taken (see below).

All configuration-files described below are included as prepared for the current index and fieldnames:

- [src/main/resources/solr/WdK/](src/main/resources/solr/WdK/) contains examples of configuration-files for the core WdK-Explorer-core: conf und lib, which need to be copied to the
- [src/main/resources/solr/WdK/conf](src/main/resources/solr/WdK/conf) contains a schema.xml and a solrconfig.xml which may need to be adapted for new fields
- [src/main/resources/solr/WdK/conf/velocity](src/main/resources/solr/WdK/conf/velocity) contains velocity-templates, javascript-files and stylesheets necessary for the interface, otpimzed for the WdK-Corpus. Here, config.vm may need to be adapted for new fields
 - [src/main/resources/solr/kjl/conf](src/main/resources/solr/kjl/conf) contains a schema.xml and a solrconfig.xml which are optimized for a childrens' literature corpus (kjl = Kinder und Jugenliteratur). However, the velocity-templates are not up to date and the config.vm will have to be adapted. An example config.vm for a kjl-corpus is included in the folder velocity but has not been tested.




Configuration of solrconfig.xml for WdK-Explorer
----

For WdK-Explorer, two requestHandler need to be defined and one additional Libary needs to be added to the configuration.

### SearchHandler **/browse**
This is the SearchHandler for VelocityResponsewriter. Here, primarily the facets that are needed for every request are defined. Each facet is defined with a corresponding exclude-Tag {!ex=fieldname} to provide for multi-select-faceting. All facets are displayed in the interface grouped by facet-type (facet.query, facet.range, facet.field) and in the order defined here. In addition, settings for facets that are not activated by default may be defined here. This way, only the facets themselves need to be activated in the query-URL.

### SearchHandler **/json**
This SearchHandler is used to fetch additional queries from the index in client side scripts. It should **closely model the query-behaviour of /browse**, but does not need to predefine facets and returns json as default-format.


### Additional Libraries
The assocTool [wdk-ui-assocTool](./wdk-ui-assocTool) is used to calculate loglikelihood-ratios in the `statsview_categories`-table. It is inserted as an additional tool into *VecolityResponseWriter*.

```xml
<queryResponseWriter name="velocity" class="solr.VelocityResponseWriter" startup="lazy">
   <lst name="tools">   
       <str name="assoc">de.uni_hildesheim.iw.wdk.velocity.assocTool.AssocTool</str>
    </lst>
</queryResponseWriter>
```    
   
The interface needs to be able to load `wdk-ui-assocTool.jar` in the core's /lib directory, with dependencies either included as jars or included into `wdk-ui-assocTool.jar` - Alternativly, they may be placed in Solr's general lib-directory.

The tool can be used from within velocity-templates calling functions of the `$assoc` object. 

schema.xml - field configuration during indexing
---
The UI assumes certain datatypes of the fields declared in [schema.xml](src/main/resources/solr/WdK/conf/schema.xml)

- Fields starting with `goobi_` (from the initial METS/MOTS-Corpus format) or in `_wdk` or `_opac` (from the *csv-files) will by default be indexed as multivalued, indexed string fields and stored. This behaviour can be overriden for selected fields of a different field-types.
- there are two types of preprocessed text-fields: `text_de`  is being analyzed as German text while `text_preprocessed` is only tokenized at whitespaces and expects text that has already been normalized and is currently used to conveniently provide the text in the form as used in topic-modeling.
- fields starting on `topic_` contain the topic-intensity in the corpus and are expected to be of field-type `tdouble`
- fields ending on `_topwords` expect topics to be indexed as string without preprocessing: These fields are used to extract topicnames throughout the tool. 
- the content for the following fields needs to be parable as an "int": `goobi_PublicationYear`, `page`, `Afz_wdk`  
- `goobi_PublicationYear` needs to be 4-digits long in the form yyyy
- The fields marked with  <!-- Multiple value metadata count fields --> are needed to provide the unique-value-option on multi-valued-fields
- a `solr.RandomSortField` is included to draw randomized samples from the index

velocity/config.vm-Configuration of fieldnames and topicmodels
----
All Index-specific variables are collected in the configuration-file `config.vm`. Here, the names of 
topicmodels, their sizes and topicmodelnames are defined. All fields used for faceting and display can be defined here.

In addition, the current version of the index is defined which is used to display the correct documentation from `velocity/doc`.


Documenting the current index in velocity/doc 
----

To make decisions for indexing and topic-modeling transparent, the most important steps are documented for each core and displayed in the client for the current core in the footer of each result-page

* date the collection was exported
* date the additional metadata were exported
* description of the index-creation process
* description of topic-models


Securing access to VelocityResponsewriter
-----

If WdK-Explorer needs to be made accessible publicly, access is needed to the following paths:

- `solr/[core-name]/browse` 
- `solr/[core-name]/json`
- `solr/admin/file`

Access to other paths should be restricted, e.g. using a reverse proxy server, to prevent commits/updates/deletes of documents in the index from other sources.

Access to the admin-interface can be secured by changing the authentication of the admin-web-app.
  
Some collected links on using VelocityResponsewriter in production environments
    
- <https://mail-archives.apache.org/mod_mbox/lucene-solr-user/201205.mbox/%3CCAJQKefH7bv11U_tSgg481hCjHovjo+GUuNyoETSZEhXR4Ve9+w@mail.gmail.com%3E>
- <https://thoughtsasaservice.wordpress.com/2012/05/10/should-you-use-solritas-on-production/>
- <https://lucidworks.com/blog/2015/12/08/browse-new-improved-solr-5/>
