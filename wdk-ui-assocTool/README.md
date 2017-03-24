# AssocTool
Implements functions to caluclate  Log-likelihood ratio using Ted Dunnings Formula and the Implementation from mahout.

On the theory cf. http://sappingattention.blogspot.de/2011/10/dunning-statistics-on-authors.html and Ted Dunning himself http://tdunning.blogspot.de/2008/03/surprise-and-coincidence.html

All functions pf  can be called from within velocityResponsewriter to augment results from solr.

AssocTool needs to be compiled as assocTool.jar and placed into the ./lib folder of the corresponding core together with the other libraries it depends on (or including these Libraries).

##Definition

In solrconfig.xml the Tool needs to be called as follows:

```xml
  <queryResponseWriter name="velocity" class="solr.VelocityResponseWriter" startup="lazy">

       <lst name="tools">   
                 <str name="assoc">de.uni_hildesheim.iw.wdk.velocity.assocTool.AssocTool</str>
   
             </lst>
    </queryResponseWriter>
```    
   
All methods can then be used in velocity from the object `$assoc`. 
    
    
##Usage example 

from statsview_categories.vm: 
    
First find number of Associations that are being compared and decide on a p-Level

```velocity      
      #set($numberOfCells = $orderedsubfacetkeys.size() * $orderedfacetkeys.size())
      #set($pvalue = 0.0001)
      
```        

Next, one can create significance and adjusted significance levels based on [Sidak-Correction](http://wordhoard.northwestern.edu/userman/analysis-comparewords.html#loglike)


```velocity 
    #set($pvalue_ajdusted = $assoc.adjustAlpha($pvalue,$numberOfCells))
    #set($llhr_significance_treshold = $assoc.getChiSigLevel($pvalue))
    #set($llhr_significance_treshold_adjusted = $assoc.getChiSigLevel($pvalue_ajdusted ))
```  
    
For each pair of associations, you can calculate the loglikelihoood for two events A and B occuring together.

* eventA_B The number of times the two events occurred together
* eventA The number of times the second event occurred
* eventB The number of times the first event occurred
* events The number of times something  occurred

```velocity 
    #set($llhr = $assoc.logLikelihoodRatioEvents($eventA_B, $eventA, $eventB, $events))
```  
    
    
In the end, you can compare the value to the significance levels computed for llhr and for llhr adjusted
```velocity     
    #set($significant = ($llhr > $llhr_significance_treshold))  
    #set($significantAdjusted = ($llhr > $llhr_significance_treshold_adjusted))
```  
