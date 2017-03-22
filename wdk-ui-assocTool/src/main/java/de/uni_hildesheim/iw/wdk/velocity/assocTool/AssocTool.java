package de.uni_hildesheim.iw.wdk.velocity.assocTool;
//org.apache.mahout.math.stats

import com.google.common.collect.ImmutableMap;
import org.apache.commons.math3.distribution.ChiSquaredDistribution;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.apache.mahout.math.stats.LogLikelihood;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Map;

/**
 * Created by ewo on 28.07.2016.
 */
public class AssocTool {

    private static Logger LOG = LogManager.getLogger(AssocTool.class);
    private static final ChiSquaredDistribution oneDegree = new ChiSquaredDistribution(1);

    private static final double STANDARD_SIGNIFICANCE_LEVEL_P = 0.01;

    public AssocTool(){



    }



    public static void main(String[] args)
        throws IOException {

        int eventA_B = 5;
        int eventA = 10;
        int eventB = 135;
        int events = 12345;

        double significanceLevel = 0.00001;
        int comparisons = 500;



        int[] event_counts = new int[]{eventA_B, eventA, eventB, events};

        printLlhrEvents(event_counts, significanceLevel, comparisons);

        AssocTool assocTool = new AssocTool();
        assocTool.testllhr();

        /* find names */
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        String input;

        System.out.print("Enter  values to calculate (root)Loglikelihood (eventA_B, eventA, eventB, events):");
        while ((input = reader.readLine()) != null) {
           args = input.split(",");

            try {
                for (int i = 0; i < event_counts.length && i < args.length && i <=4; i++) {
                    event_counts[i] = Integer.parseInt(args[i].trim());
                }
                if(args.length > 4){
                    significanceLevel = Double.parseDouble(args[4].trim());
                    if(args.length > 5){
                        comparisons = Integer.parseInt(args[5].trim());
                    }
                }
                printLlhrEvents(event_counts, significanceLevel, comparisons);

            }catch(final NumberFormatException e){
                System.out.println("Could not read number");
                System.out.println(e.getMessage());

            }
            System.out.println("Entered " + event_counts[0]
                    + ", " + event_counts[1]
                    + ", " + event_counts[2]
                    + ", " + event_counts[3]);


            System.out.println("\n\nEnter  values to calculate loglikelihood (eventA_B, eventA, eventB, events):");

        }
        reader.close();

        //more than roughly five? Use to filter?


    }
    /**
     * Calculates the Raw Log-likelihood ratio using Ted Dunnings Formula and the Implementation from mahout:
     *
     * Calculates the Raw Log-likelihood ratio for two events call them A and B. Then we have:
     * <p/>
     * <table border="1" cellpadding="5" cellspacing="0">
     * <tbody><tr><td>&nbsp;</td><td>Event A</td><td>Everything but A</td></tr>
     * <tr><td>Event B</td><td>A and B together (k_11)</td><td>B, but not A (k_12)</td></tr>
     * <tr><td>Everything but B</td><td>A without B (k_21)</td><td>Neither A nor B (k_22)</td></tr></tbody>
     * </table>
     *
     * @param k11 The number of times the two events occurred together
     * @param k12 The number of times the second event occurred WITHOUT the first event
     * @param k21 The number of times the first event occurred WITHOUT the second event
     * @param k22 The number of times something else occurred (i.e. was neither of these events
     * @return The raw LOG-likelihood ratio
     *
     * <p/>
     * Credit to http://tdunning.blogspot.com/2008/03/surprise-and-coincidence.html for the table and the descriptions.
     */
    private static double logLikelihoodRatio(long k11, long k12, long k21, long k22)
        throws Exception{
        return  LogLikelihood.logLikelihoodRatio(k11, k12, k21, k22);
    }

    /**
     * Calculates the Raw Log-likelihood ratio using Ted Dunnings Formula and the Implementation from mahout:
     *
     * Calculates the Raw Log-likelihood ratio for two events call them A and B. Then we have:
     *
     * @param eventA_B The number of times the two events occurred together
     * @param eventA The number of times the second event occurred
     * @param eventB The number of times the first event occurred
     * @param events The number of times something  occurred
     * @return The raw LOG-likelihood ratio
     *
     * <p/>
     * Credit to http://tdunning.blogspot.com/2008/03/surprise-and-coincidence.html for the table and the descriptions.
     */
    public static double logLikelihoodRatioEvents(long eventA_B, long eventA, long eventB, long events) {

        long k11 = eventA_B;
        long k12 = eventA - eventA_B;
        long k21 = eventB - eventA_B;
        long k22 = events - eventB - eventA + eventA_B;
        LOG.info("Calling logLikelihoodRatio with k11="+ k11 + " k12=" + k12 + " k21= " + k21 + " k22="+k22);

        try {
            double llhr = LogLikelihood.logLikelihoodRatio(k11, k12, k21, k22);
            LOG.info("logLikelihoodRatio: " + llhr);
            return llhr;


        }catch(final IllegalArgumentException e){
            LOG.warn("Illegal Arguments for LogLikelihood-Function");
            System.out.println("Illegal Arguments for LogLikelihood-Function");
            LOG.warn("Arguments: k11="+ k11 + " k12=" + k12 + " k21= " + k21 + " k22="+k22);
            LOG.warn(e.getStackTrace());

            return 0;
        }catch(final Exception all){
            LOG.warn("Undefined Error in LogLikelihood-Function");
            LOG.warn(all.toString());
            return 0;
        }

    }

    public String getllhrClass(){
        return LogLikelihood.class.toString();
    }

    public double testllhr(){
        long eventA_B = 5;
        long eventA = 10;
        long eventB = 135;
        long events = 12345;

        LOG.info("Testing with eventA_B=" + eventA_B
            + " eventA=" + eventA
            + " eventB=" + eventB
            + " events=" + events);

        return logLikelihoodRatioEvents(eventA_B, eventA, eventB, events);
    }

    /**
     * Calculates the Raw Log-likelihood ratio using Ted Dunnings Formula and the Implementation from mahout:
     *
     * Calculates the Raw Log-likelihood ratio for two events call them A and B. Then we have:
     *
     * @param eventA_B The number of times the two events occurred together
     * @param eventA The number of times the second event occurred
     * @param eventB The number of times the first event occurred
     * @param events The number of times something  occurred
     * @return The raw LOG-likelihood ratio
     *
     * <p/>
     * Credit to http://tdunning.blogspot.com/2008/03/surprise-and-coincidence.html for the table and the descriptions.
     */
    public static double rootLogLikelihoodRatioEvents(long eventA_B, long eventA, long eventB, long events)
        throws IllegalArgumentException{

        long k11 = eventA_B;
        long k12 = eventA - eventA_B;
        long k21 = eventB - eventA_B;
        long k22 = events - eventB - eventA + eventA_B;
        LOG.info("Calling logLikelihoodRatio with k11="+ k11 + " k12=" + k12 + " k21= " + k21 + " k22="+k22);

        try {
            double llhr = LogLikelihood.rootLogLikelihoodRatio(k11, k12, k21, k22);
            LOG.info("logLikelihoodRatio: " + llhr);
            return llhr;


        }catch(final IllegalArgumentException e){
            LOG.warn("Illegal Arguments for rootLogLikelihood-Function");
            System.out.println("Illegal Arguments for rootLogLikelihood-Function");
            LOG.warn("Arguments: k11="+ k11 + " k12=" + k12 + " k21= " + k21 + " k22="+k22);
            LOG.warn(e.getStackTrace());

            return 0.0;

        }catch(final Exception all){
            LOG.warn("Undefined Error in LogLikelihood-Function");
            LOG.warn(all.toString());
            return 0.0;
        }

    }


    public static void printLlhrEvents(int[] event_counts, double significance, int comparisons)
       {
           double llhr = logLikelihoodRatioEvents(event_counts[0], event_counts[1], event_counts[2], event_counts[3]);
           System.out.println("Raw LogLikelihood: " + llhr);
           System.out.println("Significant at 0.01?" + significantAtStandard(llhr));
           System.out.println("Significant at "+ significance + "?" + significantAt(llhr, significance));
           System.out.println("Significant at "+ significance + " in " + comparisons + "?" + significantAtAdjusted(llhr, significance, comparisons));
    }



    private static boolean readHashMapInt(
            Map<String, Integer> facetvalues)
    {
        System.out.println("readHashMapInt" + facetvalues.toString());
        LOG.info("readHashMapInt" + facetvalues.toString());
        return true;

    }

    private static boolean readHashMapString(
            Map<String, String> facetvalues)
    {
        System.out.println("readHashMapString" + facetvalues.toString());
        LOG.info("readHashMapInt" + facetvalues.toString());
        return true;
    }

    /**
     * get significance  of a given LogLikelihoodRatio for the Standard significance of STANDARD_SIGNIFICANCE_LEVEL_P = 0.01
     * @param llhr
     * @return
     */
    public static boolean significantAtStandard(
            double llhr){

       return significantAt(llhr, STANDARD_SIGNIFICANCE_LEVEL_P);

    }

    /**
     * get significance  of a given LogLikelihoodRatio given a significanse level
     * @param llhr
     * @param compensatedAlpha p-value to decide on significance
     * @return
     */
    public static boolean significantAt(
        double llhr,
        double compensatedAlpha){

        return llhr > getChiSigLevel(compensatedAlpha);

    }
    /**
     * get significance  of a given LogLikelihoodRatio given a significanse level
     * @param llhr Given LoglikelihoodRatio
     * @param uncompensatedAlpha p-value to decide on significance
     * @param numComparisons number
     * @return
     */
    public static boolean significantAtAdjusted(
            double llhr,
            double uncompensatedAlpha,
            int numComparisons){

        double compensatedAlpha = adjustAlpha(uncompensatedAlpha, numComparisons);
        LOG.info(llhr + " - compensatedAlpha for significance " + uncompensatedAlpha + " and " + numComparisons + " is "  + compensatedAlpha );
        return significantAt(llhr, compensatedAlpha );

    }

    public static double getChiSigLevel(double alpha){

        Map<Double, Double> cachedValues =  ImmutableMap.of(0.05, 3.8414588206941063,
                0.01, 6.6348966010212465,
                0.001, 10.827566170662864,
                0.0001, 15.136705226779368,
                0.00000001, 32.84125335791133);

        if(cachedValues.containsKey(alpha)){
            return cachedValues.get(alpha);
        }
        double level = oneDegree.inverseCumulativeProbability(1-alpha);
        LOG.info("alpha: " + alpha + " chisquare:" + level);
        return level;
    }

    /**
     * Computes the Sidak multiple-comparison correction
     * @param uncompensatedAlpha
     * Uncompensated alpha (p-value threshold) for the multiple comparison
     * test, must be [0,1]
     * @param numComparisons
     * Number of comparisons to make.
     * @return
     * Sidak correction
     */
    public static double adjustAlpha
    (
            double uncompensatedAlpha,
            int numComparisons )
    {
        return 1.0 - Math.pow(1.0-uncompensatedAlpha, 1.0/numComparisons);
    }



}
