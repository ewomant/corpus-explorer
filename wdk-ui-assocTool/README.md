## AssocTool
Implements functions to caluclate  Log-likelihood ratio using Ted Dunnings Formula and the Implementation from mahout.

These functions can be called from within velocityResponsewriter to augment results from solr.

AssocTool needs to be compiled as assocTool.jar and placed into the ./lib folder of the corresponding core together with the other libraries it depends on.

In solrconfig.xml the Tool needs to be defined as follows:

  <queryResponseWriter name="velocity" class="solr.VelocityResponseWriter" startup="lazy">

        <lst name="tools">
            <str name="xml">org.apache.velocity.tools.generic.XmlTool</str>
            <str name="string_class">java.lang.String</str>
            <str name="assoc">AssocTool</str><!-- callingAssocTool-->


        </lst>
    </queryResponseWriter>
