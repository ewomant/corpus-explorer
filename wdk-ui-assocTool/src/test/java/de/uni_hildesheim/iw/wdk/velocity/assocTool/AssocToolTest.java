package de.uni_hildesheim.iw.wdk.velocity.assocTool;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Created by ewo on 29.07.2016.
 */
public class AssocToolTest {

    static final int[][] TESTCASE_INPUT = {{5,10,35,30000},
                                            {1,2,35,30000},
                                            {5,100,100,30000},
                                            {100,1000,2000,30000},
                                            {200,10000,20000,30000},
                                            {3,150,100,30000},
                                            {1,6,7,300},
                                            {210,1104,20936, 172825}

    };

    static final double[] TESTCASES_LLHR = { 54.433235717588104, 10.765702700591646, 18.191896709613502,16.250340537168086, 33990.00645790032, 5.856154772685841, 2.460306310445503, 43.466007717419416 };

    static final boolean[] TESTCASES_RELEVANT_001 = {true, true, true, true,true, false, false, true };

    static final boolean[] TESTCASES_RELEVANT_001_1000 = {true, false, false, false ,true, false, false, true };

    @org.junit.Test
    public void logLikelihoodRatioEvents() throws Exception {


        for(int i = 0; i < TESTCASE_INPUT.length && i<TESTCASES_LLHR.length; i++){
            assert AssocTool.logLikelihoodRatioEvents(TESTCASE_INPUT[i][0], TESTCASE_INPUT[i][1], TESTCASE_INPUT[i][2], TESTCASE_INPUT[i][3]) == TESTCASES_LLHR[i];
        }
    }

    @org.junit.Test
    public void rootLogLikelihoodRatioEvents() throws Exception {

    }

    @org.junit.Test
    public void significantAt() throws Exception {

        for(int i = 0; i < TESTCASES_RELEVANT_001.length && i<TESTCASES_LLHR.length; i++){
            assert AssocTool.significantAt(TESTCASES_LLHR[i], 0.01) == TESTCASES_RELEVANT_001[i];
        }
    }

    @org.junit.Test
    public void significantAtAdjusted() throws Exception {
        for(int i = 0; i < TESTCASES_RELEVANT_001_1000.length && i<TESTCASES_LLHR.length; i++){
            assert AssocTool.significantAtAdjusted(TESTCASES_LLHR[i], 0.01, 1000) == TESTCASES_RELEVANT_001_1000[i];
        }

    }

    @org.junit.Test
    public void chiSigLevel() throws Exception {


        Map<Double, Double> expectedValues =  ImmutableMap.of(0.05, 3.8414588206941063,
                                                              0.01, 6.6348966010212465,
                                                            0.001, 10.827566170662864,
                                                            0.0001, 15.136705226779368,
                                                            0.000000021213, 31.3802295257202);

        for(double p : expectedValues.keySet()){
            double chiSigLevel = AssocTool.getChiSigLevel(p);
            //System.out.println(Math.round(expectedValues.get(p)*10.0)/10.0 + ": " + Math.round(chiSigLevel*10.0)/10.0);
            assert   Math.round(chiSigLevel*10.0)/10.0 ==Math.round(expectedValues.get(p)*10.0)/10.0;
        }




    }


}
